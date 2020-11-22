import Navbar from "../components/Navbar"
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlCient";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <>
      <Navbar />
      <h1>hello world</h1>
      <br />
      {!data ? <div>fetching...</div> : data.posts.map(post => <div key={post.id}>{post.title}</div>)}
    </>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index)