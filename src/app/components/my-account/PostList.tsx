import { Box, Typography } from "@mui/material";

interface PostListProps {
  posts: any[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => (
  <Box>
    <Typography variant="h6">My Posts</Typography>
    <ul>
      {posts.length > 0 ? (
        posts.map((post) => (
          <li key={post.id}>
            <Typography>{post.title}</Typography>
          </li>
        ))
      ) : (
        <Typography>No posts found.</Typography>
      )}
    </ul>
  </Box>
);

export default PostList;
