import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import dayjs from "dayjs";

function RowView({
  row,
  index,
  handleClick,
  isSelected,
  taxes,
  getExpenseFrequency,
  type,
}: {
  row: any;
  index: number;
  handleClick: any;
  isSelected: any;
  taxes: any;
  getExpenseFrequency: any;
  type: number;
}) {
  const isItemSelected = isSelected(row.id);
  const labelId = `enhanced-table-checkbox-${index}`;

  const taxObject = taxes
    ? taxes.find((tax: any) => tax.tax_id === row.tax_id)
    : 0;
  const taxRate = taxObject ? parseFloat(taxObject.tax_rate) : 0;
  const amountAfterTax: number =
    parseFloat(row.amount as string) +
    parseFloat(row.amount as string) * taxRate;

  const amountAfterSubsidy: number =
    amountAfterTax - amountAfterTax * parseFloat(row.subsidized as string);

  return (
    <TableRow
      hover
      onClick={(event) => handleClick(event, row)}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={row.id}
      selected={isItemSelected}
      sx={{ cursor: "pointer" }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isItemSelected}
          inputProps={{
            "aria-labelledby": labelId,
          }}
        />
      </TableCell>

      <TableCell component="th" id={labelId} scope="row" padding="none">
        {row.title}
      </TableCell>
      <TableCell align="right">{row.description}</TableCell>
      {type == 1 && <TableCell align="right">${row.plan_amount}</TableCell>}
      <TableCell align="right">
        $
        {type == 0
          ? (Math.round((amountAfterSubsidy as number) * 100) / 100).toFixed(2)
          : row.amount}
      </TableCell>
      <TableCell align="right">
        {dayjs(row.next_date).format("dddd")}
        <br />
        {dayjs(row.next_date).format("MMMM D, YYYY")}
        <br />
        {dayjs(row.next_date).format("h:mm A")}
      </TableCell>
      <TableCell align="right">{getExpenseFrequency(row)}</TableCell>
      {type === 1 && (
        <TableCell align="right">
          {dayjs(row.fully_paid_back).format("dddd")}
          <br />
          {dayjs(row.fully_paid_back).format("MMMM D, YYYY")}
          <br />
          {dayjs(row.fully_paid_back).format("h:mm A")}
        </TableCell>
      )}
      <br />
    </TableRow>
  );
}

export default RowView;
