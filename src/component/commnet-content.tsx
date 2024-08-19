import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { Avatar, AvatarImg, ButtonContainer, DeleteButton, Header, UpdateButton, Username } from "./tweet";
import { getDownloadURL, ref } from "firebase/storage";

export interface IComment {
    comment: string;
    createAt: number;
    tweetId: string;
    userId: string;
    username: string;
}

interface CommentContentProps {
    tweetId: string;
}

const CContents = styled.div`
    margin-top: 15px;
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 10px;
    overflow-y: scroll;
    height: 400px;
    
`;

const Content = styled.div`
    margin-right:5px;
    border: 1px solid black;
    border-radius: 10px;
    padding: 10px 10px;
`;

const Main = styled.p`
    margin: 15px 0px;
`;

export default function CommentContent({ tweetId }: CommentContentProps) {
    const [comments, setComments] = useState<IComment[]>([]);
    const [avatars, setAvatars] = useState<{ [key: string]: string | null }>({});
    const user = auth.currentUser;

    const onDelete = async () => {
        confirm("Are you sure you want to delete this comment?");
    };

    const onUpdate = async () => {
        confirm("Are you sure you want to update this tweet?");
    };

    useEffect(() => {
        // Firestore 실시간 리스너 설정
        const commentsQuery = query(
            collection(db, "comments"),
            where("tweetId", "==", tweetId),
            orderBy("createAt", "desc")
        );

        const unsubscribe = onSnapshot(commentsQuery, async (snapshot) => {
            const comments = snapshot.docs.map((doc) => {
                const { comment, createAt, tweetId, userId, username } = doc.data();
                return {
                    comment,
                    createAt,
                    tweetId,
                    userId,
                    username
                };
            });
            setComments(comments);

            const avatarPromises = comments.map(async (comment) => {
                const avatarRef = ref(storage, `avatars/${comment.userId}`);
                try {
                    const url = await getDownloadURL(avatarRef);
                    return { [comment.userId]: url };
                } catch (error) {
                    console.error("Failed to fetch avatar:", error);
                    return { [comment.userId]: null };
                }
            });
            const avatarResults = await Promise.all(avatarPromises);
            const avatarsMap = Object.assign({}, ...avatarResults);
            setAvatars(avatarsMap);
        });

        // 컴포넌트가 언마운트될 때 리스너 제거
        return () => unsubscribe();
    }, [tweetId]);



    return (
        <CContents>
            {comments.map((comment, index) => (
                <Content key={index}>
                    <Header>
                        <Avatar>
                            {avatars[comment.userId] ? (
                                <AvatarImg src={avatars[comment.userId] as string} />
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
                        <Username>{comment.username}</Username>
                    </Header>
                    <Main>{comment.comment}</Main>
                    {user?.uid === comment.userId ? (
                        <ButtonContainer>
                            {
                                
                            }
                            <UpdateButton onClick={onUpdate}>Update</UpdateButton>
                            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
                        </ButtonContainer>
                    ) : null}
                </Content>
            ))}
        </CContents>
    );
}
