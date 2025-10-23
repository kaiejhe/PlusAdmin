export const HomeCaidan = [
  { label: 'Plus卡密管理', key: 'PlusCard', path: '/dashboard/PlusCard' },
  { label: 'Plus订阅管理', key: 'PlusOrder', path: '/dashboard/PlusOrder' },
  { label: 'Team卡密管理', key: 'TeamCard', path: '/dashboard/TeamCard' },
  { label: 'Team团队管理', key: 'TeamToken', path: '/dashboard/TeamToken' },
  { label: 'Team订单管理', key: 'TeamOrder', path: '/dashboard/TeamOrder' },
];

export const BiaogeName = [
  {
    key: 'TeamCard',
    Conten: [
      { key: 'id', label: 'ID', class: '', type: 'Number', readOnly: true },
      { key: 'TeamCard', label: '兑换卡密', class: '', type: 'Text' },
      { key: 'TeamCardState', label: '使用状态', class: '', type: 'Select' },
      { key: 'AfterSales', label: '售后时长(天)', class: '', type: 'Number' },
      { key: 'AddTime', label: '添加时间', class: '', type: 'Datetime', readOnly: true },
      { key: 'UpdTime', label: '使用时间', class: '', type: 'Datetime', optional: true },
    ],
  },
  {
    key: 'TeamToken',
    Conten: [
      { key: 'id', label: 'ID', class: '', type: 'Number', readOnly: true },
      { key: 'TeamEmail', label: '团队邮箱', class: '', type: 'Text' },
      { key: 'TeamID', label: '团队编号', class: '', type: 'Text' },
      { key: 'AccToken', label: '团队密钥', class: 'max-w-[12rem] truncate text-gray-500', type: 'TextArea', previewLength: 20 },
      { key: 'NumKey', label: '剩余坑位', class: '', type: 'Number' },
      { key: 'TeamTokenState', label: '当前状态', class: '', type: 'Select' },
      { key: 'AfterSales', label: '售后时长(天)', class: '', type: 'Number' },
      { key: 'PlayContent', label: '订阅卡号', class: 'max-w-[10rem] truncate', type: 'TextArea', previewLength: 24 },
      { key: 'AddTime', label: '添加时间', class: '', type: 'Datetime', readOnly: true },
      { key: 'UpdTime', label: '更新时间', class: '', type: 'Datetime', optional: true },
    ],
  },
  {
    key: 'TeamOrder',
    Conten: [
      { key: 'id', label: 'ID', class: '', type: 'Number', readOnly: true },
      { key: 'OrderTeamID', label: '团队编号', class: '', type: 'Text' },
      { key: 'Order_us_Email', label: '进团邮箱', class: '', type: 'Text' },
      { key: 'AfterSales', label: '售后时长(天)', class: '', type: 'Number' },
      { key: 'TeamOrderState', label: '订单状态', class: '', type: 'Select' },
      { key: 'TeamCard', label: '兑换卡密', class: '', type: 'Text', optional: true },
      { key: 'TeamNum', label: '剩余名额', class: '', type: 'Number', optional: true },
      { key: 'AddTime', label: '创建时间', class: '', type: 'Datetime', readOnly: true },
      { key: 'UpdTime', label: '完成时间', class: '', type: 'Datetime', optional: true },
    ],
  },
  {
    key: 'PlusCard',
    Conten: [
      { key: 'id', label: 'ID', class: '', type: 'Number', readOnly: true },
      { key: 'PlusCard', label: '订阅卡密', class: '', type: 'Text' },
      { key: 'PlusCardState', label: '使用状态', class: '', type: 'Select' },
      { key: 'AddTime', label: '添加时间', class: '', type: 'Datetime', readOnly: true },
      { key: 'UpdTime', label: '使用时间', class: '', type: 'Datetime', optional: true },
    ],
  },
  {
    key: 'PlusOrder',
    Conten: [
      { key: 'id', label: 'ID', class: '', type: 'Number', readOnly: true },
      { key: 'usOrder', label: '订单号', class: '', type: 'Text' },
      { key: 'Email', label: '订阅邮箱', class: '', type: 'Text' },
      { key: 'Cardkey', label: '卡密', class: '', type: 'Text', optional: true },
      { key: 'AccessToken', label: 'Access Token', class: '', type: 'TextArea', optional: true },
      { key: 'State', label: '订单状态', class: '', type: 'Select' },
      { key: 'created_at', label: '创建时间', class: '', type: 'Datetime', readOnly: true },
      { key: 'updated_at', label: '更新时间', class: '', type: 'Datetime', optional: true },
    ],
  },
];

export const TableSchemaMap = Object.fromEntries(
  BiaogeName.map((group) => [group.key, group.Conten]),
);
