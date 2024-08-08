import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ITweet } from "../component/timeline";
import Tweet from "../component/tweet";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
    ::-webkit-scrollbar {
        margin-left:5px;
        width:10px;
    }
    ::-webkit-scrollbar-thumb {
        background-color: gray;
        border-radius: 5px;
        
    }
    ::-webkit-scrollbar-track { 
        background-color: silver;
        border-radius: 5px;
        height: 10px;
    }
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
    height:32px;
    font-size: 22px;
    line-height: 32px;
    text-align:center;
`;
const Tweets = styled.div`
    display: flex;
    width:100%;
    flex-direction: column;
    gap: 10px;
    overflow-y: scroll;
    height: 700px;
`;

const UpadateName = styled.div`
    margin-left:7px;
    width:30px;
    display:inline-block;
    position:absolute;
    cursor: pointer;
`;

export default function Profile() {
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatars/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, { photoURL: avatarUrl })
        }
    };
    const fetchTweets = async () => {
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
            orderBy("createAt", "desc"),
            limit(25)
        );
        const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map((doc) => {
            const { tweet, createAt, userId, username, photo } = doc.data();
            return {
                tweet, createAt, userId, username, photo, id: doc.id
            }
        });
        setTweets(tweets);
    };
    const Update =() => {
        alert("Are you going to change your name?");
    }
    useEffect(() => {
        fetchTweets();
    }, []);
    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar">
                {avatar ? (<AvatarImg src={avatar} />) : (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                </svg>)}
            </AvatarUpload>
            <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
            <Name>
                {user?.displayName ?? "Anonymous"}
                <UpadateName onClick={Update}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="size-6">
                        <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                </UpadateName>
            </Name>
            <Tweets>
                {tweets.map(tweet => <Tweet key={tweet.id} {...tweet} />)}
            </Tweets>
        </Wrapper>
    )
}