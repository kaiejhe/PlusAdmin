import { PostApi } from '@/Team/Post';

async function request(msgoogle, data = {}) {
  const response = await PostApi(
    JSON.stringify({
      msgoogle,
      data,
    }),
  );

  if (!response) {
    throw new Error('网络请求失败');
  }
  return response;
}

export async function loginApi({ username, password }) {
  return request('login', { username, password });
}

export async function fetchListApi({ table, filters, page, pageSize }) {
  return request('getlist', { table, filters, page, pageSize });
}

export async function createItemApi({ table, data }) {
  return request('addlist', { table, data });
}

export async function updateItemApi({ table, id, updates }) {
  return request('updlist', { table, id, updates });
}

export async function deleteItemApi({ table, id }) {
  return request('dellist', { table, id });
}

export async function bulkCreateCardsApi({ type, cardList, afterSales, teamType }) {
  return request('foradd', {
    type,
    CardList: cardList,
    AfterSales: afterSales,
    TeamType: teamType,
  });
}
