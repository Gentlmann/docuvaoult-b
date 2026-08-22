const PLAN_QUOTAS_MB = {
  basic: 50 * 1024,        // 51,200 MB = 50 GB
  professional: 100 * 1024, // 102,400 MB = 100 GB
  enterprise: 200 * 1024,   // 204,800 MB = 200 GB
};

function getDefaultQuotaForPlan(plan) {
  return PLAN_QUOTAS_MB[plan] || PLAN_QUOTAS_MB.basic;
}

module.exports = { PLAN_QUOTAS_MB, getDefaultQuotaForPlan };