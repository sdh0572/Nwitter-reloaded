import { useState, useEffect } from "react";
import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteObject, ref, getDownloadURL } from "firebase/storage";
import PostCommentForm from "./post-comment-form";
import CommentContent from "./commnet-content";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  margin-right: 5px;
  cursor: pointer;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:last-child {
    place-self: end;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Photo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 15px;
`;

export const Username = styled.div`
  font-weight: 600;
  font-size: 15px;
  margin-left: 10px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 5px;
  margin: 0px auto; // 나중에 추가 수정
`;

export const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

export const UpdateButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

export const Avatar = styled.div`
  width: 30px;
  height: 30px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #1d9bf0;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

export const AvatarImg = styled.img`
  width: 100%;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const Popup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  background-color: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  #close {
    position: fixed;
    right: 20px;
    border: none;
    background-color: white;
    font-size: 30px;
    cursor: pointer;
  }
`;

const Content = styled.div`
  #username {
    font-weight: bold;
  }
  #tweet {
    height: 95px;
    border: 1px solid silver;
    border-radius: 10px;
    padding: 5px 5px;
    margin-bottom: 10px;
  }
  #photo {
    width: 460px;
    height: 460px;
    margin-bottom: 10px;
  }
`;

const HeartButton = styled.div`
  color: gray;
  width: 70px;
  background-color: white;
  font-size: 20px;
  margin: 5px 0px;
  cursor: pointer;
  #heart {
    display: inline-block;
    color: red;
  }
  #heartInPopup {
    display: inline-block;
    color: red;
    margin-bottom: 10px;
  }
`;

const Comment = styled.div`
  position: fixed;
  top: 50%;
  left: calc(50% + 260px);  /* Popup의 너비(500px) + 간격(20px) / 2 */
  transform: translateY(-50%);
  background-color:white;
  padding: 20px;
  border-radius: 15px;
  width: 400px;
  height: 600px;
  z-index: 1001;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [heart, setHeart] = useState<number>(0); // Heart를 상태로 관리
  const user = auth.currentUser;

  useEffect(() => {
    const fetchAvatar = async () => {
      if (userId) {
        const avatarRef = ref(storage, `avatars/${userId}`);
        try {
          const url = await getDownloadURL(avatarRef);
          setAvatar(url);
        } catch (error) {
          console.error("Failed to fetch avatar:", error);
        }
      }
    };
    fetchAvatar();
  }, [userId]);

  useEffect(() => {
    const fetchHeart = async () => {
      const tweetDoc = doc(db, "tweets", id);
      try {
        const tweetSnap = await getDoc(tweetDoc);
        if (tweetSnap.exists()) {
          const tweetData = tweetSnap.data();
          setHeart(tweetData.heart || 0);
        }
      } catch (error) {
        console.error("Failed to fetch heart:", error);
      }
    };
    fetchHeart();
  }, [id]);

  const onDelete = async (event: React.MouseEvent) => {
    event.stopPropagation(); // 클릭 이벤트가 상위 요소로 전파되지 않도록 막음
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onUpdate = async (event: React.MouseEvent) => {
    event.stopPropagation();
    confirm("Are you sure you want to update this tweet?");
  };

  const handleWrapperClick = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleHeartClick = async (event: React.MouseEvent) => {
    event.stopPropagation(); // 클릭 이벤트가 상위 요소로 전파되지 않도록 막음
    try {
      const tweetDoc = doc(db, "tweets", id);
      await updateDoc(tweetDoc, { heart: heart + 1 });
      setHeart((prevHeart) => prevHeart + 1);
    } catch (error) {
      console.error("Failed to update heart:", error);
    }
  };

  return (
    <>
      <Wrapper onClick={handleWrapperClick}>
        <Column>
          <div>
            <Header>
              <Avatar>
                {avatar ? (
                  <AvatarImg src={avatar} />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                  </svg>
                )}
              </Avatar>
              <Username>{username}</Username>
            </Header>
            <Payload>{tweet}</Payload>
          </div>
          <HeartButton onClick={handleHeartClick}><p id="heart">♡</p> {heart}</HeartButton>
        </Column>
        <Column>{photo ? <Photo src={photo} /> : null}</Column>
      </Wrapper>

      {isPopupOpen && (
        <>
          <Overlay onClick={closePopup} />
          <div>
            <Popup>
              <button id="close" onClick={closePopup}>
                X
              </button>
              <Content>
                <Header>
                  <Avatar>
                    {avatar ? (
                      <AvatarImg src={avatar} />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-5"
                      >
                        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                      </svg>
                    )}
                  </Avatar>
                  <Username>{username}</Username>
                </Header>
                <p id="tweet">{tweet}</p>
                {photo && <Photo id="photo" src={photo} />}
              </Content>
              <HeartButton onClick={handleHeartClick}><p id="heartInPopup">♡</p> {heart}</HeartButton>
              {user?.uid === userId ? (
                <ButtonContainer>
                  <UpdateButton onClick={onUpdate}>Update</UpdateButton>
                  <DeleteButton onClick={onDelete}>Delete</DeleteButton>
                </ButtonContainer>
              ) : null}
            </Popup>
            <Comment>
              <PostCommentForm
                tweetId={id} 
              />
              <CommentContent
                tweetId={id} 
              />
            </Comment>
          </div>
        </>
      )}
    </>
  );
}
