<template>
  <div v-if="!config">
    <Alert variant="destructive">
      <AlertDescription>未找到当前页面的配置，请检查菜单设置。</AlertDescription>
    </Alert>
  </div>
  <div v-else class="space-y-6">
<header class="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">{{ config.title }}</h1>
    <p class="mt-1 text-sm text-gray-500">{{ config.description }}</p>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <Button
      variant="destructive"
      @click="bulkDelete"
      :disabled="!selectedIds.length || saving"
    >
      批量删除
    </Button>
    <Button variant="outline" @click="refresh" :disabled="loading">
      {{ loading ? '刷新中...' : '刷新' }}
    </Button>
    <Button v-if="config.enableBulkCreate" variant="outline" @click="openBulkModal">
      批量添加
    </Button>
    <Button v-if="!isTeamCardResource" @click="openCreateModal">新增</Button>
      </div>
    </header>

    <Alert v-if="feedback.message" :variant="feedback.type === 'error' ? 'destructive' : 'default'">
      <AlertDescription>{{ feedback.message }}</AlertDescription>
    </Alert>

    <form class="grid gap-4 rounded-lg border border-dashed border-gray-200 p-4 sm:grid-cols-2 lg:grid-cols-3" @submit.prevent="handleSearch">
      <div
        v-for="field in config.searchFields"
        :key="field.field"
        class="flex flex-col gap-2"
      >
        <Label :for="`search-${field.field}`">{{ field.label }}</Label>
        <template v-if="field.type === 'select'">
          <select
            :id="`search-${field.field}`"
            v-model="searchModel[field.field]"
            class="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">全部</option>
            <option
              v-for="option in getStatusOptions(field.optionsKey)"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </template>
        <template v-else>
          <Input
            :id="`search-${field.field}`"
            v-model="searchModel[field.field]"
            :placeholder="field.placeholder"
          />
        </template>
      </div>
      <div class="flex items-end gap-2">
        <Button type="submit" :disabled="loading">查询</Button>
        <Button type="button" variant="outline" @click="resetSearch" :disabled="loading">重置</Button>
      </div>
    </form>

<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="w-12 px-4 py-3">
            <input
              type="checkbox"
              class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              :checked="allSelected"
              :indeterminate.prop="indeterminateSelection"
              @change="toggleSelectAll"
              :disabled="!selectableRowIds.length"
            />
          </th>
          <th
            v-for="column in tableColumns"
            :key="column.key"
            class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
                {{ column.label }}
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                操作
              </th>
            </tr>
          </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        <tr v-if="loading">
          <td :colspan="tableColumns.length + 2" class="px-4 py-6 text-center text-sm text-gray-500">
            数据加载中...
          </td>
        </tr>
        <tr v-else-if="!rows.length">
          <td :colspan="tableColumns.length + 2" class="px-4 py-6 text-center text-sm text-gray-500">
            当前暂无数据
          </td>
        </tr>
        <tr v-else v-for="row in rows" :key="row.id ?? row._rowKey">
          <td class="px-4 py-3">
            <input
              type="checkbox"
              class="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              :disabled="row.id === undefined || row.id === null"
              :checked="isRowSelected(row.id)"
              @change="toggleRowSelection(row.id)"
            />
          </td>
          <td
            v-for="column in tableColumns"
            :key="column.key"
            :class="['px-4 py-3 text-sm text-gray-700', column.class]"
          >
            <span>{{ formatValue(column, row[column.key]) }}</span>
          </td>
          <td class="px-4 py-3 text-right text-sm">
            <div class="flex flex-wrap justify-end gap-2">
              <template v-if="isTeamOrderResource">
                <Button variant="secondary" size="sm" @click="handleSwapTeam(row)">换团</Button>
                <Button variant="secondary" size="sm" @click="handleInvite(row)">邀请</Button>
              </template>
              <Button variant="outline" size="sm" @click="openEditModal(row)">编辑</Button>
              <Button variant="destructive" size="sm" @click="deleteRecord(row)">删除</Button>
            </div>
          </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <div>共 {{ total }} 条数据 · 第 {{ page }} 页</div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" :disabled="page <= 1 || loading" @click="changePage(page - 1)">
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="page >= maxPage || loading"
            @click="changePage(page + 1)"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>

    <TransitionRoot appear :show="showFormModal" as="template">
      <Dialog class="relative z-50" @close="closeFormModal">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center px-4 py-10">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel class="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <Card>
                  <CardHeader>
                    <CardTitle>{{ isEditing ? '编辑' : '新增' }} · {{ config.title }}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form class="space-y-4" @submit.prevent="submitForm">
                      <div
                        v-for="field in formFields"
                        :key="field.key"
                        class="space-y-2"
                      >
                        <Label :for="`form-${field.key}`">{{ field.label }}</Label>
                        <template v-if="isSelect(field)">
                          <select
                            :id="`form-${field.key}`"
                            v-model="formModel[field.key]"
                            class="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          >
                            <option value="">请选择</option>
                            <option
                              v-for="option in getStatusOptions(field.key)"
                              :key="option.value"
                              :value="option.value"
                            >
                              {{ option.label }}
                            </option>
                          </select>
                        </template>
                        <template v-else-if="field.type === 'TextArea'">
                          <textarea
                            :id="`form-${field.key}`"
                            v-model="formModel[field.key]"
                            rows="4"
                            :readonly="config.table === 'PlusEmail' && field.key === 'EmailTxt' && !isEditing"
                            class="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                        </template>
                        <template v-else>
                          <Input
                            :id="`form-${field.key}`"
                            v-model="formModel[field.key]"
                            :type="field.type === 'Number' ? 'number' : 'text'"
                          />
                        </template>
                        <p
                          v-if="config.table === 'TeamToken' && field.key === 'AccToken'"
                          class="text-xs text-gray-500"
                        >
                          粘贴完整的团队密钥 JSON，系统会自动提取邮箱和团队编号。
                        </p>
                        <p
                          v-if="config.table === 'PlusEmail' && field.key === 'PlusAccToken'"
                          class="text-xs text-gray-500"
                        >
                          支持直接粘贴帐号 JSON，系统会自动提取邮箱、帐号 ID 与 Token。
                        </p>
                        <p
                          v-if="config.table === 'PlusEmail' && field.key === 'EmailTxt' && !isEditing"
                          class="text-xs text-gray-500"
                        >
                          新增时系统会自动获取邮箱登录密钥，无需手动填写。
                        </p>
                        <div
                          v-if="config.table === 'TeamToken' && field.key === 'AccToken' && teamTokenPreview"
                          class="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600"
                        >
                          <template v-if="teamTokenPreview.error">
                            {{ teamTokenPreview.error }}
                          </template>
                          <template v-else>
                            <div>解析邮箱：{{ teamTokenPreview.email || '未解析' }}</div>
                            <div>团队编号：{{ teamTokenPreview.teamId || '未解析' }}</div>
                          </template>
                        </div>
                        <div
                          v-if="config.table === 'PlusEmail' && field.key === 'PlusAccToken' && plusAccountPreview"
                          class="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600"
                        >
                          <template v-if="plusAccountPreview.error">
                            {{ plusAccountPreview.error }}
                          </template>
                          <template v-else>
                            <div>帐号邮箱：{{ plusAccountPreview.email || '未解析' }}</div>
                            <div>帐号ID：{{ plusAccountPreview.userId || '未解析' }}</div>
                          </template>
                        </div>
                      </div>
                      <div class="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" @click="closeFormModal">取消</Button>
                        <Button type="submit" :disabled="saving">{{ saving ? '提交中...' : '保存' }}</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <TransitionRoot appear :show="showBulkModal" as="template">
      <Dialog class="relative z-50" @close="closeBulkModal">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center px-4 py-10">
            <TransitionChild
              as="template"
              enter="ease-out duration-300"
              enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enter-to="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 translate-y-0 sm:scale-100"
              leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel class="w-full max-w-xl rounded-xl bg-white shadow-xl">
                <Card>
                  <CardHeader>
                    <CardTitle>批量添加 · {{ config.title }}</CardTitle>
                    <CardDescription>{{ bulkDialogDescription }}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form class="space-y-4" @submit.prevent="submitBulk">
                      <div class="grid gap-4 sm:grid-cols-2">
                        <div
                          v-if="!isTeamCardResource"
                          class="space-y-2"
                        >
                          <Label for="bulk-prefix">生成前缀</Label>
                          <Input
                            id="bulk-prefix"
                            v-model="bulkForm.prefix"
                            placeholder="例如 TEAM"
                          />
                        </div>
                        <div
                          :class="['space-y-2', isTeamCardResource ? 'sm:col-span-2' : '']"
                        >
                          <Label for="bulk-quantity">生成数量</Label>
                          <Input
                            id="bulk-quantity"
                            v-model="bulkForm.quantity"
                            type="number"
                            min="1"
                          />
                        </div>
                        <div
                          v-if="config.bulkType === 'Team'"
                          class="space-y-2"
                        >
                          <Label for="bulk-team-type">Card Type</Label>
                          <select
                            id="bulk-team-type"
                            v-model="bulkForm.teamType"
                            class="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                            <option
                              v-for="option in STATUS_OPTIONS.TeamType || []"
                              :key="option.value"
                              :value="option.value"
                            >
                              {{ option.label }}
                            </option>
                          </select>
                        </div>
                        <div
                          v-if="config.bulkRequiresAfterSales"
                          class="space-y-2 sm:col-span-2"
                        >
                          <Label for="bulk-after-sales">售后时长（天）</Label>
                          <Input
                            id="bulk-after-sales"
                            v-model="bulkForm.afterSales"
                            type="number"
                            min="0"
                          />
                        </div>
                      </div>
                      <div class="space-y-2">
                        <div class="flex items-center justify-between">
                          <Label for="bulk-manual">卡密列表</Label>
                          <Button
                            v-if="isTeamCardResource"
                            type="button"
                            size="sm"
                            variant="outline"
                            :disabled="saving"
                            @click="generateTeamCards"
                          >
                            生成卡密
                          </Button>
                        </div>
                        <textarea
                          id="bulk-manual"
                          v-model="bulkForm.manualInput"
                          rows="6"
                          :placeholder="isTeamCardResource ? '点击上方按钮后将自动生成卡密，也可手动调整，每行一条' : '每行一个卡密，留空时根据前缀自动生成'"
                          class="block w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                        <p
                          v-if="isTeamCardResource"
                          class="text-xs text-gray-500"
                        >
                          先生成卡密并核对内容，无需填写前缀，系统会自动补齐格式。
                        </p>
                      </div>

                      <div class="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" @click="closeBulkModal">取消</Button>
                        <Button type="submit" :disabled="saving">{{ saving ? '提交中...' : '提交批量任务' }}</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <TransitionRoot as="template" :show="loading || saving">
      <TransitionChild
        as="div"
        enter="ease-out duration-200"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-150"
        leave-from="opacity-100"
        leave-to="opacity-0"
        class="fixed inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur-sm"
      >
        <div class="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-lg">
          <svg
            class="size-5 animate-spin text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span class="text-sm font-medium text-gray-700">
            {{ loading ? '正在加载数据…' : '操作进行中…' }}
          </span>
        </div>
      </TransitionChild>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  bulkCreateCardsApi,
  createItemApi,
  deleteItemApi,
  fetchListApi,
  updateItemApi,
} from '@/api';
import { RESOURCE_CONFIG, STATUS_OPTIONS } from '@/resources/config';
import { TableSchemaMap } from '@/Team/UI';
import { GetTime, RandomGroup } from '@/Team/Post';

const props = defineProps({
  resourceKey: {
    type: String,
    required: true,
  },
});

const PAGE_SIZE = 10;
const API_PAGE_SIZE = 200;
const MAX_FETCH_PAGES = 50;
const TEAM_CARD_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const page = ref(1);
const total = ref(0);
const rows = ref([]);
const allRows = ref([]);
const loading = ref(false);
const saving = ref(false);
const selectedIds = ref([]);

const feedback = reactive({
  type: 'default',
  message: '',
});

const searchModel = reactive({});

const showFormModal = ref(false);
const showBulkModal = ref(false);
const editingRecord = ref(null);
const formModel = reactive({});
const bulkForm = reactive({
  prefix: '',
  quantity: 10,
  manualInput: '',
  afterSales: 0,
  teamType: 'Team',
});

const config = computed(() => RESOURCE_CONFIG[props.resourceKey] || null);
const isTeamTokenResource = computed(() => config.value?.table === 'TeamToken');
const isPlusEmailResource = computed(() => config.value?.table === 'PlusEmail');
const isTeamCardResource = computed(() => config.value?.table === 'TeamCard');
const isTeamOrderResource = computed(() => config.value?.table === 'TeamOrder');
const bulkDialogDescription = computed(() => {
  if (!config.value) return '';
  if (isTeamCardResource.value) {
    return '设置数量后点击生成按钮，系统会自动填充卡密列表（可在提交前调整，每行一条）。';
  }
  return '支持自动生成或手动粘贴卡密列表，每行一条。';
});

const teamTokenPreview = computed(() => {
  if (!isTeamTokenResource.value) return null;
  const raw = (formModel.AccToken ?? '').trim();
  if (!raw || !raw.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(raw);
    const email = typeof parsed?.user?.email === 'string' ? parsed.user.email : '';
    const teamId = typeof parsed?.account?.id === 'string' ? parsed.account.id : '';
    return {
      email,
      teamId,
      token: typeof parsed?.accessToken === 'string' ? parsed.accessToken : '',
    };
  } catch (error) {
    return { error: 'JSON 解析失败，请检查格式' };
  }
});

const plusAccountPreview = computed(() => {
  if (!isPlusEmailResource.value) return null;
  const raw = (formModel.PlusAccToken ?? '').trim();
  if (!raw || !raw.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(raw);
    const email =
      typeof parsed?.user?.email === 'string'
        ? parsed.user.email
        : typeof parsed?.email === 'string'
          ? parsed.email
          : '';
    const userId =
      typeof parsed?.account?.id === 'string'
        ? parsed.account.id
        : typeof parsed?.accountId === 'string'
          ? parsed.accountId
          : typeof parsed?.user?.id === 'string'
            ? parsed.user.id
            : '';
    const token =
      typeof parsed?.accessToken === 'string'
        ? parsed.accessToken
        : typeof parsed?.token === 'string'
          ? parsed.token
          : '';
    return { email, userId, token };
  } catch (error) {
    return { error: 'JSON 解析失败，请检查格式' };
  }
});

const tableColumns = computed(() => {
  if (!config.value) return [];
  return TableSchemaMap[config.value.table] || [];
});

const fieldMetaMap = computed(() => {
  return tableColumns.value.reduce((acc, field) => {
    acc[field.key] = field;
    return acc;
  }, {});
});

const formFields = computed(() => {
  if (!config.value) return [];
  return (config.value.editableFields || [])
    .map((key) => fieldMetaMap.value[key])
    .filter(Boolean);
});

const selectableRowIds = computed(() =>
  rows.value
    .map((row) => row.id)
    .filter((id) => id !== null && id !== undefined),
);

const isEditing = computed(() => Boolean(editingRecord.value));

const maxPage = computed(() =>
  Math.max(1, Math.ceil(total.value / PAGE_SIZE)),
);

const allSelected = computed(
  () =>
    selectableRowIds.value.length > 0 &&
    selectableRowIds.value.every((id) => selectedIds.value.includes(id)),
);

const indeterminateSelection = computed(
  () => selectedIds.value.length > 0 && !allSelected.value,
);

watch(
  () => props.resourceKey,
  () => {
    resetSearchModel();
    page.value = 1;
    fetchData();
  },
);

onMounted(() => {
  resetSearchModel();
  fetchData();
});

function setFeedback(type, message) {
  feedback.type = type;
  feedback.message = message;
}

function clearFeedback() {
  feedback.type = 'default';
  feedback.message = '';
}

function clearSelection() {
  selectedIds.value = [];
}

function describeTeamOrder(row = {}) {
  const id = row?.id ?? '未知ID';
  const email = row?.Order_us_Email ?? '未知邮箱';
  const teamId = row?.OrderTeamID ? `团队 ${row.OrderTeamID}` : null;
  return [teamId, `邮箱 ${email}`, `ID ${id}`].filter(Boolean).join(' · ');
}

function handleSwapTeam(row) {
  if (!isTeamOrderResource.value) return;
  setFeedback('default', `「换团」功能建设中：${describeTeamOrder(row)}`);
}

function handleInvite(row) {
  if (!isTeamOrderResource.value) return;
  setFeedback('default', `「邀请」功能建设中：${describeTeamOrder(row)}`);
}

function updateVisibleRows() {
  const start = (page.value - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  rows.value = allRows.value.slice(start, end);
}

function resetSearchModel() {
  clearFeedback();
  Object.keys(searchModel).forEach((key) => {
    delete searchModel[key];
  });
  config.value?.searchFields.forEach((field) => {
    searchModel[field.field] = '';
  });
}

function getStatusOptions(optionsKey) {
  if (!optionsKey) return [];
  return STATUS_OPTIONS[optionsKey] || [];
}

function getStatusLabel(fieldKey, value) {
  const options = getStatusOptions(fieldKey);
  const match = options.find((item) => item.value === value);
  return match ? match.label : null;
}

function normalizeTimestampToMilliseconds(numeric) {
  const candidates = [
    numeric,
    numeric * 1000,
    numeric / 1000,
    numeric / 1_000_000,
  ]
    .map((value) => Math.round(value))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (!candidates.length) {
    return Math.round(numeric);
  }
  const now = Date.now();
  let best = candidates[0];
  let bestDiff = Math.abs(best - now);
  for (let index = 1; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const diff = Math.abs(candidate - now);
    if (diff < bestDiff) {
      best = candidate;
      bestDiff = diff;
    }
  }
  return best;
}

function formatTimestamp(value) {
  if (value === null || value === undefined || value === '') return '-';
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) {
    return String(value);
  }
  const timestamp = normalizeTimestampToMilliseconds(numeric);
  return GetTime(timestamp);
}

function formatValue(field, value) {
  if (value === null || value === undefined || value === '') return '-';
  if (field?.type === 'Datetime') {
    return formatTimestamp(value);
  }
  const statusLabel = getStatusLabel(field.key, value);
  if (statusLabel) return statusLabel;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (field?.previewLength && trimmed.length > field.previewLength) {
      return `${trimmed.slice(0, field.previewLength)}…`;
    }
    return trimmed || '-';
  }
  return String(value);
}

function buildFilters() {
  const filters = {};
  config.value?.searchFields.forEach((field) => {
    const rawValue = searchModel[field.field];
    if (rawValue !== '' && rawValue !== null && rawValue !== undefined) {
      filters[field.field] = typeof rawValue === 'string'
        ? rawValue.trim()
        : rawValue;
    }
  });
  return filters;
}

async function fetchAllPages({ table, filters }) {
  const pageSize = Math.max(API_PAGE_SIZE, PAGE_SIZE);
  const collected = [];
  const seenKeys = new Set();
  let totalCount = 0;
  let currentPage = 1;

  while (true) {
    const response = await fetchListApi({
      table,
      filters,
      page: currentPage,
      pageSize,
    });
    if (!response?.ok) {
      throw new Error(response?.msg || '查询失败');
    }
    if (currentPage === 1) {
      totalCount = Number(response.total) || 0;
    }
    const chunk = Array.isArray(response.data) ? response.data : [];
    chunk.forEach((item, index) => {
      const key =
        item?.id ??
        item?.TeamCard ??
        item?.PlusCard ??
        item?.PlusEmail ??
        item?.Email ??
        item?.Card ??
        `page${currentPage}-row${index}-${collected.length}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        collected.push(item);
      }
    });
    if (chunk.length === 0) {
      break;
    }
    if (chunk.length < pageSize) {
      break;
    }
    if (totalCount && collected.length >= totalCount) {
      break;
    }
    if (currentPage >= MAX_FETCH_PAGES) {
      break;
    }
    currentPage += 1;
  }

  if (!totalCount) {
    totalCount = collected.length;
  }
  return { records: collected, totalCount };
}

function getSortFields() {
  const fields = [
    config.value?.defaultSortField,
    'created_at',
    'createdAt',
    'created_time',
    'createdTime',
    'AddTime',
    'AddDatetime',
    'AddDate',
    'Add_at',
    'Addtime',
    'Add_date',
  ].filter(Boolean);
  fields.push('id');
  return Array.from(new Set(fields));
}

function normalizeSortValue(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    if (Math.abs(numeric) > 1e8) {
      return normalizeTimestampToMilliseconds(numeric);
    }
    return numeric;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
}

function compareRecordsByFields(a, b, fields) {
  for (const field of fields) {
    const valueA = normalizeSortValue(a?.[field]);
    const valueB = normalizeSortValue(b?.[field]);
    if (valueA === null && valueB === null) {
      continue;
    }
    if (valueA === null) {
      return 1;
    }
    if (valueB === null) {
      return -1;
    }
    const diff = valueB - valueA;
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

async function fetchData() {
  if (!config.value) return;
  loading.value = true;
  clearFeedback();
  clearSelection();
  try {
    const filters = buildFilters();
    const effectiveFilters =
      Object.keys(filters).length ? filters : undefined;
    const { records, totalCount } = await fetchAllPages({
      table: config.value.table,
      filters: effectiveFilters,
    });
    const sortFields = getSortFields();
    const sortedRows = Array.isArray(records) ? [...records] : [];
    sortedRows.sort((a, b) => compareRecordsByFields(a, b, sortFields));
    allRows.value = sortedRows.map((item, index) => ({
      _rowKey: `${index}-${item?.id ?? ''}`,
      ...item,
    }));
    total.value = allRows.value.length || totalCount || 0;
    if (!allRows.value.length) {
      rows.value = [];
      page.value = 1;
      return;
    }
    const maxAllowedPage = Math.max(1, Math.ceil(total.value / PAGE_SIZE));
    if (page.value > maxAllowedPage) {
      page.value = maxAllowedPage;
    }
    updateVisibleRows();
  } catch (error) {
    allRows.value = [];
    rows.value = [];
    total.value = 0;
    setFeedback('error', error.message || '查询失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchData();
}

function resetSearch() {
  resetSearchModel();
  handleSearch();
}

function changePage(nextPage) {
  if (nextPage < 1 || nextPage > maxPage.value || nextPage === page.value) {
    return;
  }
  page.value = nextPage;
  clearSelection();
  updateVisibleRows();
}

function refresh() {
  fetchData();
}

function isRowSelected(id) {
  if (id === null || id === undefined) return false;
  return selectedIds.value.includes(id);
}

function toggleRowSelection(id) {
  if (id === null || id === undefined) return;
  if (isRowSelected(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
}

function toggleSelectAll() {
  if (!selectableRowIds.value.length) {
    selectedIds.value = [];
    return;
  }

  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = [...selectableRowIds.value];
  }
}

function prepareFormModel(record) {
  formFields.value.forEach((field) => {
    const key = field.key;
    if (record) {
      const value = record[key];
      formModel[key] =
        value === null || value === undefined ? '' : String(value);
    } else if (config.value?.defaults?.[key] !== undefined) {
      formModel[key] = String(config.value.defaults[key]);
    } else if (field.type === 'Number') {
      formModel[key] = '0';
    } else {
      formModel[key] = '';
    }
  });
}

function openCreateModal() {
  if (!config.value || isTeamCardResource.value) return;
  editingRecord.value = null;
  prepareFormModel(null);
  showFormModal.value = true;
}

function openEditModal(record) {
  editingRecord.value = record;
  prepareFormModel(record);
  showFormModal.value = true;
}

function closeFormModal(force = false) {
  if (!force && saving.value) return;
  showFormModal.value = false;
  editingRecord.value = null;
}

function isSelect(field) {
  return field?.type === 'Select';
}

function normalizeFieldValue(field, value) {
  if (field.type === 'Number') {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      throw new Error(`字段「${field.label}」需要为数字`);
    }
    return numeric;
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  return value ?? '';
}

async function applyResourceSpecificTransforms(payload) {
  const table = config.value?.table;
  if (table === 'TeamToken') {
    const rawInput = (formModel.AccToken ?? '').trim();
    if (!rawInput) {
      throw new Error('请填写团队密钥');
    }
    let accessToken = rawInput;
    let teamEmail = (formModel.TeamEmail ?? '').trim() || editingRecord.value?.TeamEmail || '';
    let teamId = (formModel.TeamID ?? '').trim() || editingRecord.value?.TeamID || '';
    if (rawInput.startsWith('{')) {
      let parsed;
      try {
        parsed = JSON.parse(rawInput);
      } catch (error) {
        throw new Error('团队密钥格式错误，请粘贴完整的 JSON 文本');
      }
      const parsedToken = String(parsed?.accessToken ?? '').trim();
      const parsedEmail = String(parsed?.user?.email ?? '').trim();
      const parsedTeamId = String(parsed?.account?.id ?? '').trim();
      if (parsedToken) accessToken = parsedToken;
      if (parsedEmail) teamEmail = parsedEmail;
      if (parsedTeamId) teamId = parsedTeamId;
    }
    if (!accessToken) {
      throw new Error('无法获取 accessToken，请检查密钥内容');
    }
    if (!teamEmail || !teamId) {
      throw new Error('无法解析团队邮箱或团队编号，请确认信息正确');
    }
    payload.AccToken = accessToken;
    payload.TeamEmail = teamEmail;
    payload.TeamID = teamId;
    return;
  }

  if (table === 'PlusEmail') {
    const rawInput = (formModel.PlusAccToken ?? '').trim();
    if (!rawInput) {
      throw new Error('请填写帐号 Token');
    }
    let accountToken = rawInput;
    let accountEmail = editingRecord.value?.PlusEmail || '';
    let accountId = editingRecord.value?.PlusUserID || '';
    if (rawInput.startsWith('{')) {
      let parsed;
      try {
        parsed = JSON.parse(rawInput);
      } catch (error) {
        throw new Error('帐号 Token 格式错误，请粘贴合法的 JSON 文本');
      }
      const parsedToken = String(parsed?.accessToken ?? parsed?.token ?? '').trim();
      const parsedEmail = String(parsed?.user?.email ?? parsed?.email ?? '').trim();
      const parsedId = String(parsed?.account?.id ?? parsed?.accountId ?? parsed?.user?.id ?? '').trim();
      if (parsedToken) accountToken = parsedToken;
      if (parsedEmail) accountEmail = parsedEmail;
      if (parsedId) accountId = parsedId;
    } else if (!editingRecord.value) {
      throw new Error('帐号 Token 必须为 JSON，系统会自动解析邮箱与帐号 ID');
    }
    accountToken = String(accountToken).trim();
    accountEmail = accountEmail ? String(accountEmail).trim() : '';
    accountId = accountId ? String(accountId).trim() : '';
    if (!accountToken) {
      throw new Error('无法获取帐号 Token，请确认内容有效');
    }
    if (!accountEmail) {
      throw new Error('无法获取帐号邮箱，请在表单中补全或提供 JSON');
    }
    if (!accountId) {
      throw new Error('无法获取帐号 ID，请在表单中补全或提供 JSON');
    }
    payload.PlusAccToken = accountToken;
    payload.PlusEmail = accountEmail;
    payload.PlusUserID = accountId;
    if (!isEditing.value) {
      const emailKey = await requestEmailLoginKey(accountEmail);
      payload.EmailTxt = emailKey;
      formModel.EmailTxt = emailKey;
    }
  }
}

function appendTimestamps(payload) {
  if (!isEditing.value) {
    if (fieldMetaMap.value.AddTime && payload.AddTime === undefined) {
      payload.AddTime = Date.now();
    }
    if (fieldMetaMap.value.created_at && payload.created_at === undefined) {
      payload.created_at = Math.floor(Date.now() / 1000);
    }
  }
  if (fieldMetaMap.value.UpdTime && payload.UpdTime === undefined) {
    payload.UpdTime = Date.now();
  }
  if (fieldMetaMap.value.updated_at && payload.updated_at === undefined) {
    payload.updated_at = Math.floor(Date.now() / 1000);
  }
}

async function requestEmailLoginKey(email) {
  const endpoint = 'https://eamilapi.saas-176001.workers.dev/create';
  if (!email) {
    throw new Error('无法获取帐号邮箱，无法生成邮箱登录密钥');
  }
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    throw new Error('请求邮箱登录密钥接口失败，请检查网络后重试');
  }
  const rawBody = await response.text();
  let parsed = null;
  if (rawBody) {
    try {
      parsed = JSON.parse(rawBody);
    } catch (error) {
      parsed = null;
    }
  }
  if (!response.ok) {
    const message = parsed?.msg || response.statusText || '服务异常';
    throw new Error(`邮箱登录密钥接口请求失败：${message}`);
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('邮箱登录密钥接口返回异常，无法解析数据');
  }
  if (!parsed.ok) {
    throw new Error(parsed.msg ? `邮箱登录密钥接口返回错误：${parsed.msg}` : '邮箱登录密钥接口未能成功返回密钥');
  }
  if (!parsed.key) {
    throw new Error('邮箱登录密钥接口未返回密钥，请稍后重试');
  }
  return String(parsed.key);
}

async function submitForm() {
  if (!config.value) return;
  saving.value = true;
  clearFeedback();
  let succeeded = false;
  let successMessage = '';
  try {
    const payload = {};
    formFields.value.forEach((field) => {
      const skipEmailKeyAutoFill =
        config.value?.table === 'PlusEmail' &&
        field.key === 'EmailTxt' &&
        !isEditing.value;
      if (skipEmailKeyAutoFill) {
        return;
      }
      const raw = formModel[field.key];
      if (
        (raw === '' || raw === null || raw === undefined) &&
        !field.optional &&
        field.type !== 'Number'
      ) {
        throw new Error(`字段「${field.label}」不能为空`);
      }
      payload[field.key] = normalizeFieldValue(field, raw);
    });

    await applyResourceSpecificTransforms(payload);
    appendTimestamps(payload);

    let response;
    if (isEditing.value) {
      const id = editingRecord.value.id;
      if (!id) {
        throw new Error('缺少记录标识，无法更新');
      }
      response = await updateItemApi({
        table: config.value.table,
        id,
        updates: payload,
      });
    } else {
      response = await createItemApi({
        table: config.value.table,
        data: payload,
      });
    }

    if (!response?.ok) {
      throw new Error(response?.msg || '操作失败');
    }

    succeeded = true;
    successMessage = response.msg || '操作成功';
    setFeedback('success', successMessage);
  } catch (error) {
    setFeedback('error', error.message || '操作失败');
  } finally {
    saving.value = false;
    if (succeeded) {
      closeFormModal(true);
      await fetchData();
      if (feedback.type !== 'error') {
        setFeedback('success', successMessage);
      }
    }
  }
}

async function deleteRecord(record) {
  if (!config.value || !record?.id) {
    setFeedback('error', '当前记录缺少唯一标识，无法删除');
    return;
  }
  const confirmed = window.confirm('确定删除该数据吗？此操作不可撤回。');
  if (!confirmed) return;
  saving.value = true;
  clearFeedback();
  try {
    const response = await deleteItemApi({
      table: config.value.table,
      id: record.id,
    });
    if (!response?.ok) {
      throw new Error(response?.msg || '删除失败');
    }
    setFeedback('default', response.msg || '删除成功');
    fetchData();
  } catch (error) {
    setFeedback('error', error.message || '删除失败');
  } finally {
    saving.value = false;
  }
}

function resetBulkForm() {
  bulkForm.prefix = isTeamCardResource.value ? '' : (config.value?.generatePrefix || '');
  bulkForm.quantity = 10;
  bulkForm.manualInput = '';
  bulkForm.afterSales = config.value?.bulkRequiresAfterSales ? 30 : 0;
  bulkForm.teamType = config.value?.bulkType === 'Team'
    ? (STATUS_OPTIONS.TeamType ? STATUS_OPTIONS.TeamType[0]?.value || 'Team' : 'Team')
    : bulkForm.teamType;
}

function openBulkModal() {
  if (!config.value) return;
  resetBulkForm();
  showBulkModal.value = true;
}

function closeBulkModal(force = false) {
  if (!force && saving.value) return;
  showBulkModal.value = false;
}

function createTeamCardSegment() {
  let segment = '';
  for (let index = 0; index < 4; index += 1) {
    const randomIndex = Math.floor(Math.random() * TEAM_CARD_CHARSET.length);
    segment += TEAM_CARD_CHARSET[randomIndex];
  }
  return segment;
}

function createTeamCardCode() {
  return [
    createTeamCardSegment(),
    createTeamCardSegment(),
    createTeamCardSegment(),
    createTeamCardSegment(),
  ].join('-');
}

function createTeamCardCodes(quantity) {
  const codes = new Set();
  while (codes.size < quantity) {
    codes.add(createTeamCardCode());
  }
  return [...codes];
}

function generateTeamCards() {
  if (!isTeamCardResource.value) return;
  clearFeedback();
  try {
    const quantity = Number(bulkForm.quantity);
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error('请填写正确的生成数量');
    }
    const cards = createTeamCardCodes(quantity);
    bulkForm.manualInput = cards.join('\n');
    setFeedback('default', `已生成 ${cards.length} 条卡密，提交前可按需调整。`);
  } catch (error) {
    setFeedback('error', error.message || '生成卡密失败');
  }
}

function buildBulkCards() {
  const manualCards = bulkForm.manualInput
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (manualCards.length) {
    return Array.from(new Set(manualCards));
  }
  if (isTeamCardResource.value) {
    throw new Error('请先生成卡密或手动填写卡密列表');
  }
  const prefix = bulkForm.prefix.trim() || config.value?.generatePrefix || 'CARD';
  const quantity = Number(bulkForm.quantity);
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error('请填写正确的生成数量');
  }
  return RandomGroup(quantity, prefix);
}

async function submitBulk() {
  if (!config.value?.enableBulkCreate) return;
  saving.value = true;
  clearFeedback();
  let succeeded = false;
  let successMessage = '';
  try {
    const cards = buildBulkCards();
    if (!cards.length) {
      throw new Error('未获取到任何卡密，请检查输入');
    }
    const afterSalesValue = config.value.bulkRequiresAfterSales
      ? Number(bulkForm.afterSales)
      : 0;
    if (
      config.value.bulkRequiresAfterSales &&
      (!Number.isFinite(afterSalesValue) || afterSalesValue < 0)
    ) {
      throw new Error('售后时长需要是非负整数');
    }

    const response = await bulkCreateCardsApi({
      type: config.value.bulkType,
      cardList: cards,
      afterSales: afterSalesValue,
      teamType: config.value.bulkType === 'Team' ? bulkForm.teamType : undefined,
    });

    if (!response?.ok) {
      throw new Error(response?.msg || '批量添加失败');
    }

    succeeded = true;
    successMessage = response.msg || '批量添加成功';
    setFeedback('success', successMessage);
  } catch (error) {
    setFeedback('error', error.message || '批量添加失败');
  } finally {
    saving.value = false;
    if (succeeded) {
      closeBulkModal(true);
      await fetchData();
      if (feedback.type !== 'error') {
        setFeedback('success', successMessage);
      }
    }
  }
}

async function bulkDelete() {
  if (!config.value || !selectedIds.value.length) return;
  const count = selectedIds.value.length;
  const confirmed = window.confirm(`确定删除选中的 ${count} 条数据吗？此操作不可撤回。`);
  if (!confirmed) return;

  saving.value = true;
  clearFeedback();
  let successMessage = '';

  try {
    const table = config.value.table;
    for (const id of selectedIds.value) {
      const response = await deleteItemApi({ table, id });
      if (!response?.ok) {
        throw new Error(response?.msg || `删除失败 (ID: ${id})`);
      }
      successMessage = response.msg || '批量删除成功';
    }

    clearSelection();
    await fetchData();
    if (!successMessage) {
      successMessage = '批量删除成功';
    }
    if (feedback.type !== 'error') {
      setFeedback('success', successMessage);
    }
  } catch (error) {
    setFeedback('error', error.message || '批量删除失败');
  } finally {
    saving.value = false;
  }
}
</script>
