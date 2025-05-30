const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const mockDir = path.join(__dirname, "mock_data");
const masterData = JSON.parse(fs.readFileSync(path.join(mockDir, "master.json"), "utf-8"));

function filterDataByDateAndAccount(dateList, accounts, startDate, endDate) {
  return dateList
    .filter((item) => item.businessDate >= startDate && item.businessDate <= endDate)
    .map((item) => {
      const matchedResponses = item.trenDataResponseList.filter((res) =>
        accounts.some((acc) => acc.accountId === res.account.accountId)
      );
      return matchedResponses.length > 0
        ? { businessDate: item.businessDate, trenDataResponseList: matchedResponses }
        : null;
    })
    .filter(Boolean);
}
// Fallback POST handler for dynamic mock lookup

app.post("/getConsolidatedTrendData", (req, res) => {
  const { dateType, startDate, endDate, consolidatedTrendRequestList } = req.body;
  const accounts = consolidatedTrendRequestList.account;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msToday = today.getTime();

  let filteredTrendDateList = [];

  if (dateType === "PRIOR_DAY") {
    const priorDay = msToday - 86400000;
    filteredTrendDateList = filterDataByDateAndAccount(masterData.trendDateList, accounts, priorDay, priorDay);
  } else if (dateType === "SPECIFIC_DATE") {
    filteredTrendDateList = filterDataByDateAndAccount(masterData.trendDateList, accounts, startDate, startDate);
  } else if (dateType === "DATE_RANGE") {
    filteredTrendDateList = filterDataByDateAndAccount(masterData.trendDateList, accounts, startDate, endDate);
  } else {
    return res.status(400).json({ error: "Invalid dateType" });
  }

  return res.status(200).json({
    trendDateList: filteredTrendDateList,
    reason: null,
    success: true,
    failureMsg: null,
    errorMsgList: null,
    userId: "reportmcuucashpyu1"
  });
});

app.post("/getNonConsolidatedTrendData", (req, res) => {
  const { trendDataRequestList } = req.body;

  const nonConsolidatedMaster = JSON.parse(
    fs.readFileSync(path.join(mockDir, "getNonConsolidatedTrendData-response.json"), "utf-8")
  );

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msToday = today.getTime();

  const resultList = [];

  for (const reqItem of trendDataRequestList) {
    const { account, dateType, startDate, endDate } = reqItem;

    let from = 0;
    let to = 0;

    if (dateType === "PRIOR_DAY") {
      from = to = msToday - 86400000; 
    } else if (dateType === "SPECIFIC_DATE") {
      if (!endDate || isNaN(endDate)) continue;
      from = to = endDate;
    } else if (dateType === "DATE_RANGE") {
      if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) continue;
      from = startDate;
      to = endDate;
    } else {
      continue; 
    }

    const matchedAccount = nonConsolidatedMaster.trenDataResponseList.find(
      (entry) =>
        entry.account.accountId === account.accountId &&
        entry.account.bankId === account.bankId
    );

    if (matchedAccount) {
      const filteredTrendData = matchedAccount.trendDataList.filter(
        (data) => data.businessDate >= from && data.businessDate <= to
      );

      resultList.push({
        account: matchedAccount.account,
        trendDataList: filteredTrendData
      });
    }
  }

  return res.status(200).json({
    userId: "reoprtmcucashpyu1",
    errorMsgList: null,
    failureMsg: null,
    reason: null,
    trenDataResponseList: resultList,
    success: true
  });
});



app.post(/^\/(?!getConsolidatedTrendData$|nonconsolidated$).*/, (req, res) => {
  const routePath = req.path.replace(/^\/+/, ""); 
  const mockFileName = `${routePath}.json`;
  const mockFilePath = path.join(mockDir, mockFileName);

  if (fs.existsSync(mockFilePath)) {
    try {
      const responseData = JSON.parse(fs.readFileSync(mockFilePath, "utf-8"));
      return res.status(200).json(responseData);
    } catch (err) {
      return res.status(500).json({ error: "Invalid JSON in mock file." });
    }
  } else {
    return res.status(404).json({ error: `No handler or mock file found for POST ${req.path}` });
  }
});


const PORT = 8080;
app.listen(PORT, () => console.log(`Mock server running on port ${PORT}`));
