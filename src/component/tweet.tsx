import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  margin-right: 5px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:last-child {
    place-self: end;
  }
  height: 100px;
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 5px;
`;

const DeleteButton = styled.button`
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

const UpdateButton = styled.button`
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

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete this tweet?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id))
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {

    }
  }
  const onUpdate = async () => {
    confirm("Are you sure you want to update this tweet?");
  }
  return (
    <Wrapper>
      <Column>
        <div>
          <Username>{username}</Username>
          <Payload>{tweet}</Payload>
        </div>
        {user?.uid === userId ? (
          <ButtonContainer>
            <UpdateButton onClick={onUpdate}>Update</UpdateButton>
            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
          </ButtonContainer>
        ) : null}
      </Column>
      <Column>
        {photo ? <Photo src={photo} /> : null}
      </Column>
    </Wrapper>
  );
}
