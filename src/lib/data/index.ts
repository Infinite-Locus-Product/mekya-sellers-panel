/**
 * Data layer entry. All data access goes through here for easy API integration later.
 */

export { getOrders, getOrderDetails } from "./orders";
export { getUsers } from "./users";
export {
  getProducts,
  getB2BProducts,
  getEditableProductDraftById,
  type EditableProductDraft,
} from "./products";
export { getReturns, getReturnDetails, type ReturnItem } from "./returns";
export { getCustomOrders, type CustomOrder } from "./customOrders";
export { getProfile, type ProfilePageData } from "./profile";
export {
  getCmsLandingData,
  getCmsOverviewData,
  type CmsSection,
  type CmsLandingData,
  type CmsOverviewStats,
  type RecentActivityEntry,
  type TopBlogEntry,
} from "./cms";
