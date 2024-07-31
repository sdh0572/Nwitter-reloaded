import styled from "styled-components";
import PostTweetForm from "../component/post-tweet-form";
import Timeline from "../component/timeline";

const Wrapper = styled.div`
    display: grid;
    gap: 50px;
    overflow-y: scroll;
    grid-template-rows: 1fr 5fr;
    ::-webkit-scrollbar {
        display:none; /*하위만 됨*/
    }
    scrollbar-width: none; /*하위는 안됨*/
`;
export default function Home() {

    return (
        <Wrapper>
            <PostTweetForm />
            <Timeline></Timeline>
        </Wrapper>
    )
}