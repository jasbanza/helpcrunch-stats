/*

1. Get tags
2. get chats by tag (recursive function calling REST endpoint with paging)
3. process data -> build report

*/

import fetch from "node-fetch";
import config from "./config.js";
import tags from "./tags.js";
import { ConsoleLogColors } from "js-console-log-colors";
const out = new ConsoleLogColors();

// const apiUrl = "https://api.helpcrunch.com/v1/customers/search";
// const apiUrl =  "https://api.helpcrunch.com/v1/customers?sort=customers.lastSeen";
// const apiUrl = "https://api.helpcrunch.com/v1/chats?sort=chats.closedAt&order=asc";

const now = new Date();
const daysAgo = 30;
const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
const timestampSince = Math.floor(startDate.getTime() / 1000);

(async () => {
  const chatsGroupedByTags = await getChatsGroupedByTags(timestampSince, tags);
  const allChats = [];
  processData({ chatsGroupedByTags, allChats, daysAgo });
})();

async function getChatsGroupedByTags(timestampSince, tags) {
  const chatsGroupedByTags = {};
  for (const tag of tags) {
    out.command(`Fetching chats for tag: "${tag.name}"...`);
    const chatsByTag = await fetchPaginatedChats(timestampSince, tag.name);
    if (chatsByTag.length) {
      out.info(`... Found ${chatsByTag.length}`);
    }

    chatsGroupedByTags[tag.name] = chatsByTag;
  }
  return chatsGroupedByTags;
}

async function fetchPaginatedChats(
  timestampSince,
  tagName = null,
  offset = 0,
  limit = 100,
  data = []
) {
  const url = "https://api.helpcrunch.com/v1/chats/search";
  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + config.API_KEY,
  };

  const requestBody = {
    comparison: "AND",
    filter: [
      {
        field: "chats.createdAt",
        operator: ">",
        value: `${timestampSince}`,
      },
      {
        field: "chats.customer.tagsData",
        operator: "=",
        value: [{ name: tagName }],
      },
    ],
    limit: limit,
    offset: offset,
    sort: "chats.createdAt",
    order: "DESC",
  };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });
  const json = await response.json();
  try {
    data.push(...json.data);
  } catch (e) {
    //console.log(json);
  }
  if (json.total > offset + limit) {
    return fetchPaginatedChats(url, offset + limit, limit, data);
  }

  return data;
}

function processData({ chatsGroupedByTags, allChats, daysAgo }) {
  // const data = [
  //   { id: 1, tags: ["moving money", "evmos"] },
  //   { id: 2, tags: ["evmos", "account"] },
  //   { id: 3, tags: ["transaction"] },
  //   { id: 4, tags: [] },
  //   { id: 5 },
  // ];

  // Extract all tags from the data and count their occurrences

  const tagCounts = {};
  for (const tag in chatsGroupedByTags) {
    const chatsByTag = chatsGroupedByTags[tag];
    tagCounts[tag] = chatsByTag.length;
  }

  // Output the tag counts and total number of chats with and without tags
  console.log();
  console.log();
  console.log();
  console.log(`Ticket count by tags in the last ${daysAgo} days:`);
  Object.entries(tagCounts).forEach(([tag, count]) => {
    if (count > 0) {
      console.log(`- ${tag}: ${count}`);
    }
  });
}

// const numChats = data.length;
// const numChatsWithTag = Object.values(tagCounts).reduce(
//   (sum, count) => sum + count,
//   0
// );
// const numChatsWithoutTag = numChats - numChatsWithTag;

// console.log(`Total Number of Chats: ${numChats}`);
// console.log(`Number of Chats with Tags: ${numChatsWithTag}`);
// console.log(`Number of Chats without Tags: ${numChatsWithoutTag}`);
