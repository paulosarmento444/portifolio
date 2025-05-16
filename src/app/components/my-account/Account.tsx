import { Box, Typography } from "@mui/material";

const Account: React.FC<any> = ({ username, billing, role }) => {
  // console.log(billing);
  return (
    <Box>
      <Typography variant="h6">{role}</Typography>
    </Box>
  );
};

export default Account;
