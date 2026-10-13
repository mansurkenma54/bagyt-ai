import { mkdir, writeFile } from "node:fs/promises";
import ExcelJS from "exceljs";
import sharp from "sharp";
import Papa from "papaparse";
async function main() {
  await mkdir("fixtures", { recursive: true });
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const d = date.toISOString().slice(0, 10);
  const rows = [
    {
      external_id: "IMPORT-001",
      date: d,
      amount: "32500.50",
      cost: "25000.00",
      status: "paid",
      order_id: "ORDER-IMPORT-001",
      payment_id: "PAY-IMPORT-001",
      channel: "Магазин",
    },
    {
      external_id: "IMPORT-002",
      date: d,
      amount: "18500",
      cost: "12000",
      status: "pending",
      order_id: "ORDER-IMPORT-002",
      payment_id: "",
      channel: "Сайт",
    },
    {
      external_id: "IMPORT-003",
      date: d,
      amount: "57000",
      cost: "41000",
      status: "paid",
      order_id: "ORDER-IMPORT-003",
      payment_id: "PAY-IMPORT-003",
      channel: "Магазин",
    },
  ];
  await writeFile("fixtures/pos-sales.csv", "\uFEFF" + Papa.unparse(rows));
  const wb = new ExcelJS.Workbook(),
    ws = wb.addWorksheet("Продажи");
  ws.addRow(Object.keys(rows[0]));
  rows.forEach((r) => ws.addRow(Object.values(r)));
  ws.getRow(1).font = { bold: true };
  await wb.xlsx.writeFile("fixtures/pos-sales.xlsx");
  await writeFile(
    "fixtures/invalid-sales.csv",
    "external_id,date,amount,status\nBAD-001,not-a-date,-5,paid\n",
  );
  await writeFile(
    "fixtures/website-duplicate.csv",
    `external_id,date,amount,cost,status,order_id,payment_id\nWEB-IMPORT-001,${d},32500.50,25000,paid,ORDER-IMPORT-001,PAY-IMPORT-001\n`,
  );
  await writeFile(
    "fixtures/leads.csv",
    `external_id,date,amount,status,responded_at,order_id,text\nLEAD-NEW-01,${d}T08:00:00+05:00,0,open,,,Можно узнать наличие?\nLEAD-NEW-02,${d}T09:00:00+05:00,0,converted,${d}T09:10:00+05:00,IMPORT-001,Подтвержденная покупка\n`,
  );
  await writeFile(
    "fixtures/leads-updated.csv",
    `external_id,date,amount,status,responded_at,order_id,text\nLEAD-NEW-01,${d}T08:00:00+05:00,0,closed,${d}T08:12:00+05:00,,Ответ подтвержден\n`,
  );
  await writeFile(
    "fixtures/campaigns.csv",
    `external_id,date,amount,status,name,views\nCAMPAIGN-001,${d},25000,active,Осенний набор,4500\n`,
  );
  await writeFile(
    "fixtures/reviews.csv",
    `external_id,date,amount,status,rating,text\nREV-001,${d},0,published,3,Долго ждал ответ\nREV-002,${d},0,published,5,Хороший ассортимент\n`,
  );
  await writeFile(
    "fixtures/expenses.csv",
    `external_id,date,amount,status,name\nEXP-NEW-001,${d},12000,paid,Доставка\n`,
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1200"><rect width="1000" height="1200" fill="white"/><g fill="black" font-family="Arial" text-anchor="middle"><text x="500" y="130" font-size="60" font-weight="bold">BAGYT DEMO RECEIPT</text><text x="500" y="210" font-size="30">SYNTHETIC TEST DOCUMENT</text><text x="500" y="320" font-size="42">Date: ${d}</text><text x="500" y="440" font-size="42">Delivery service</text><text x="500" y="580" font-size="48">TOTAL: 12500.00</text><text x="500" y="680" font-size="40">Currency: KZT</text><text x="500" y="800" font-size="32">Not a fiscal receipt</text></g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile("fixtures/demo-receipt.png");
  console.log("Fixtures generated:", d);
}
main();
