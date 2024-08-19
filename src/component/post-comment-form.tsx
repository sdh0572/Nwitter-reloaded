import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import styled from "styled-components";
import { auth, db } from "../firebase";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const TextArea = styled.textarea`
    border: 1.5px solid gray;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    background-color: white;
    width: 100%;
    height: 100px;
    resize: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    &::placeholder {
        font-size: 16px;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf0;
    }
`;

const SubmitBtn = styled.input`
    background-color: #1d9bf0;
    color: white;
    border: none;
    padding: 10px 0px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    &:hover,
    &:active {
        opacity: 0.9;
    }
`;

interface PostCommentFormProps {
    tweetId: string;
}

export default function PostCommentForm({ tweetId }: PostCommentFormProps) {
    const [isLoading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const user = auth.currentUser;

    if (!user) return null; // 사용자가 로그인되지 않은 경우 아무 것도 렌더링하지 않음

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading || content === "" || content.length > 180) return;

        try {
            setLoading(true);
            await addDoc(collection(db, "comments"), {
                tweetId: tweetId, // Popup에서 전달된 생성 시간
                userId: user.uid, // 현재 로그인한 사용자의 ID
                comment: content,
                username: user.displayName || "Anonymous",
                createAt: Date.now()
            });
            setContent(""); // 댓글 작성 후 입력란 초기화
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={onSubmit}>
            <TextArea
                required
                rows={5}
                maxLength={180}
                onChange={onChange}
                value={content}
                placeholder="Please leave a comment"
            />
            <SubmitBtn
                type="submit"
                value={isLoading ? "Posting..." : "Post Comment"}
            />
        </Form>
    );
}
