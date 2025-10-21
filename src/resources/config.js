export const STATUS_OPTIONS = {
  TeamCardState: [
    { label: '未使用', value: 'o1' },
    { label: '已使用', value: 'o2' },
    { label: '已失效', value: 'o3' },
  ],
  TeamTokenState: [
    { label: '启用', value: 'o1' },
    { label: '停用', value: 'o2' },
  ],
  TeamOrderState: [
    { label: '待处理', value: 'o1' },
    { label: '已完成', value: 'o2' },
    { label: '失败', value: 'o3' },
  ],
  PlusCardState: [
    { label: '未使用', value: 'o1' },
    { label: '已使用', value: 'o2' },
    { label: '已失效', value: 'o3' },
  ],
  State: [
    { label: '待处理', value: 'o1' },
    { label: '已完成', value: 'o2' },
    { label: '失败', value: 'o3' },
  ],
};

export const RESOURCE_CONFIG = {
  TeamCard: {
    title: 'Team卡密管理',
    description: '管理 Team 产品卡密，支持查询、批量导入及状态维护。',
    table: 'TeamCard',
    searchFields: [
      { field: 'TeamCard', label: '兑换卡密', type: 'text', placeholder: '输入完整或部分卡密' },
      { field: 'TeamCardState', label: '状态', type: 'select', optionsKey: 'TeamCardState' },
    ],
    editableFields: ['TeamCard', 'TeamCardState', 'AfterSales'],
    enableBulkCreate: true,
    bulkType: 'Team',
    bulkRequiresAfterSales: true,
    generatePrefix: 'TEAM',
    defaults: {
      TeamCardState: 'o1',
      AfterSales: 0,
    },
  },
  TeamToken: {
    title: 'Team团队管理',
    description: '维护 Team 团队 Token 信息，支持独立新增与配额调整。',
    table: 'TeamToken',
    searchFields: [
      { field: 'TeamEmail', label: '团队邮箱', type: 'text' },
      { field: 'TeamID', label: '团队编号', type: 'text' },
      { field: 'TeamTokenState', label: '状态', type: 'select', optionsKey: 'TeamTokenState' },
    ],
    editableFields: [
      'AccToken',
      'NumKey',
      'TeamTokenState',
      'AfterSales',
      'VisaTxt',
    ],
    defaults: {
      TeamTokenState: 'o1',
      NumKey: 0,
      AfterSales: 0,
      VisaTxt: '',
    },
  },
  TeamOrder: {
    title: 'Team订单管理',
    description: '查看与维护 Team 订单，可手动创建测试数据。',
    table: 'TeamOrder',
    searchFields: [
      { field: 'OrderTeamID', label: '团队编号', type: 'text' },
      { field: 'Order_us_Email', label: '进团邮箱', type: 'text' },
      { field: 'TeamOrderState', label: '状态', type: 'select', optionsKey: 'TeamOrderState' },
    ],
    editableFields: [
      'OrderTeamID',
      'Order_us_Email',
      'AfterSales',
      'TeamOrderState',
      'TeamCard',
      'TeamNum',
    ],
    defaults: {
      TeamOrderState: 'o1',
      TeamNum: 0,
      AfterSales: 0,
    },
  },
  PlusCard: {
    title: 'Plus卡密管理',
    description: '管理 Plus 订阅卡密，支持批量导入和状态修改。',
    table: 'PlusCard',
    searchFields: [
      { field: 'PlusCard', label: '订阅卡密', type: 'text' },
      { field: 'PlusCardState', label: '状态', type: 'select', optionsKey: 'PlusCardState' },
    ],
    editableFields: ['PlusCard', 'PlusCardState'],
    enableBulkCreate: true,
    bulkType: 'Plus',
    generatePrefix: 'PLUS',
    defaults: {
      PlusCardState: 'o1',
    },
  },
  PlusOrder: {
    title: 'Plus订阅管理',
    description: '手动维护 Plus 订阅订单，便于调试与运营。',
    table: 'PlusOrder',
    searchFields: [
      { field: 'Email', label: '订阅邮箱', type: 'text' },
      { field: 'usOrder', label: '订单号', type: 'text' },
      { field: 'State', label: '状态', type: 'select', optionsKey: 'State' },
    ],
    editableFields: ['usOrder', 'Email', 'Cardkey', 'AccessToken', 'State'],
    defaults: {
      State: 'o1',
    },
  },
};
