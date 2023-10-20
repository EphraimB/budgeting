import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Skeleton from "@mui/material/Skeleton";

function Loading() {
  return (
    <TableRow sx={{ height: 53 * 5 }}>
      <TableCell colSpan={6}>
        <Skeleton />
      </TableCell>
    </TableRow>
  );
}

export default Loading;
