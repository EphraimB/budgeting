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
  getNextExpenseDateAndFrequency,
}: {
  row: any;
  index: number;
  handleClick: any;
  isSelected: any;
  taxes: any;
  getNextExpenseDateAndFrequency: any;
}) {
  const isItemSelected = isSelected(row.expense_id);
  const labelId = `enhanced-table-checkbox-${index}`;

  const taxObject = taxes
    ? taxes.find((tax: any) => tax.tax_id === row.tax_id)
    : 0;
  const taxRate = taxObject ? parseFloat(taxObject.tax_rate) : 0;
  const amountAfterTax: number =
    parseFloat(row.expense_amount as string) +
    parseFloat(row.expense_amount as string) * taxRate;

  const amountAfterSubsidy: number =
    amountAfterTax -
    amountAfterTax * parseFloat(row.expense_subsidized as string);

  return (
    <TableRow
      hover
      onClick={(event) => handleClick(event, row)}
      role="checkbox"
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={row.expense_id}
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
        {row.expense_title}
      </TableCell>
      <TableCell align="right">{row.expense_description}</TableCell>
      <TableCell align="right">
        ${(Math.round((amountAfterSubsidy as number) * 100) / 100).toFixed(2)}
      </TableCell>
      <TableCell align="right">
        {dayjs(getNextExpenseDateAndFrequency(row).next_expense_date).format(
          "dddd"
        )}
        <br />
        {dayjs(getNextExpenseDateAndFrequency(row).next_expense_date).format(
          "MMMM D, YYYY"
        )}
        <br />
        {dayjs(getNextExpenseDateAndFrequency(row).next_expense_date).format(
          "h:mm A"
        )}
      </TableCell>
      <TableCell align="right">
        {getNextExpenseDateAndFrequency(row).expense_frequency}
      </TableCell>
    </TableRow>
  );
}

export default RowView;
