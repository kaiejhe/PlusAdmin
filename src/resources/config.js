export const STATUS_OPTIONS = {
  TeamCardState: [
    { label: '未使用', value: 'o1' },
    { label: '已使用', value: 'o2' },
    { label: '已失效', value: 'o3' },
  ],
  TeamType: [
    { label: 'Team Code', value: 'Team' },
    { label: 'Plus Account', value: 'Plus' },
    { label: 'Plus iOS', value: 'PlusIOS' },
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
  PlusState: [
    { label: '待使用', value: 'o1' },
    { label: '已使用', value: 'o2' },
    { label: '封禁中', value: 'o3' },
  ],
  DisableState: [
    { label: '封禁中', value: 'o1' },
    { label: '已解除', value: 'o2' },
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
    defaultSortField: 'AddTime',
    searchFields: [
      { field: 'TeamCard', label: '兑换卡密', type: 'text', placeholder: '输入完整或部分卡密' },
      { field: 'TeamCardState', label: '状态', type: 'select', optionsKey: 'TeamCardState' },
      { field: 'TeamType', label: 'Card Type', type: 'select', optionsKey: 'TeamType' },
    ],
    editableFields: ['TeamCard', 'TeamType', 'TeamCardState', 'AfterSales'],
    enableBulkCreate: true,
    bulkType: 'Team',
    bulkRequiresAfterSales: true,
    generatePrefix: 'TEAM',
    defaults: {
      TeamType: 'Team',
      TeamCardState: 'o1',
      AfterSales: 0,
    },
  },
  TeamToken: {
    title: 'Team团队管理',
    description: '维护 Team 团队 Token 信息，支持独立新增与配额调整。',
    table: 'TeamToken',
    defaultSortField: 'AddTime',
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
      'PlayContent',
    ],
    defaults: {
      TeamTokenState: 'o1',
      NumKey: 0,
      AfterSales: 0,
      PlayContent: '',
    },
  },
  TeamOrder: {
    title: 'Team订单管理',
    description: '查看与维护 Team 订单，可手动创建测试数据。',
    table: 'TeamOrder',
    defaultSortField: 'AddTime',
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
    defaultSortField: 'AddTime',
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
  PlusEmail: {
    title: 'Plus成品号管理',
    description: '维护 Plus 成品帐号信息，支持解析 JSON 并同步帐号状态。',
    table: 'PlusEmail',
    defaultSortField: 'AddTime',
    searchFields: [
      { field: 'PlusEmail', label: '帐号邮箱', type: 'text', placeholder: '支持模糊搜索' },
      { field: 'PlusState', label: '当前状态', type: 'select', optionsKey: 'PlusState' },
      { field: 'PlusCard', label: '绑定兑换码', type: 'text', placeholder: '输入完整或部分兑换码' },
      { field: 'EmailTxt', label: '邮箱登录密钥', type: 'text', placeholder: '按密钥快速定位' },
    ],
    editableFields: [
      'PlusAccToken',
      'PlusPassword',
      'PlusState',
      'AfterSales',
      'EmailTxt',
    ],
    defaults: {
      PlusState: 'o1',
      AfterSales: 0,
    },
  },
  PlusOrder: {
    title: 'Plus订阅管理',
    description: '手动维护 Plus 订阅订单，便于调试与运营。',
    table: 'PlusOrder',
    defaultSortField: 'created_at',
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
  Disable: {
    title: 'Email封禁管理',
    description: '维护被封禁的邮箱列表，便于后台快速查找、解封或新增限制。',
    table: 'disable',
    defaultSortField: 'AddTime',
    searchFields: [
      { field: 'email', label: '邮箱地址', type: 'text', placeholder: '输入完整邮箱地址' },
      { field: 'state', label: '封禁状态', type: 'select', optionsKey: 'DisableState' },
    ],
    editableFields: ['email', 'state'],
    defaults: {
      state: 'o1',
    },
  },
};
