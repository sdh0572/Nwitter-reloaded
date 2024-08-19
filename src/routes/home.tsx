import styled from "styled-components";
import PostTweetForm from "../component/post-tweet-form";
import Timeline from "../component/timeline";

const Wrapper = styled.div`
    display: grid;
    gap: 50px;
    grid-template-rows: 1fr 5fr;
    overflow-y: scroll;
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