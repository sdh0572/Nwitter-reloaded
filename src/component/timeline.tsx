import { useEffect, useState } from "react";
import styled from "styled-components";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
    id: string;
    photo: string;
    tweet: string;
    userId: string;
    username: string;
    createAt: number;
}

const Wrapper = styled.div`
    display: flex;
    gap: 10px;
    flex-direction: column;
    overflow-y: scroll;
`;

export default function Timeline() {
    const [tweets, setTweet] = useState<ITweet[]>([]);

    useEffect(() => {
        let unsubscribe: Unsubscribe | null = null;
        const fetchTweets = async () => {
            const tweetsQuery = query(
                collection(db, "tweets"),
                orderBy("createAt", "desc"),
                limit(25)
            );
            // const spanshot = await getDocs(tweetsQuery);
            // const tweets = spanshot.docs.map((doc) =>{
            //     const { tweet, createAt, userId, username, photo} = doc.data();
            //     return {
            //         tweet, createAt, userId, username, photo, id: doc.id
            //     }
            // });
            unsubscribe = await onSnapshot(tweetsQuery, (snaphot) => {
                const tweets = snaphot.docs.map((doc) => {
                    const { tweet, createAt, userId, username, photo } = doc.data();
                    return {
                        tweet, createAt, userId, username, photo, id: doc.id
                    };
                });
                setTweet(tweets);
            });
        };
        fetchTweets();
        return () => {
            unsubscribe && unsubscribe();
        }
    }, []);
    return (<Wrapper>
        {tweets.map((tweet) => (
            <Tweet key={tweet.id} {...tweet} />
        ))}
    </Wrapper>
    );
}