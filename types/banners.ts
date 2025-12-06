/**
 * Banner Types and Interfaces
 */

export enum BannerType {
  PROMOTIONAL = 0,
  INFORMATIONAL = 1,
  ANNOUNCEMENT = 2,
  ADVERTISEMENT = 3,
}

export const BannerTypeLabels: Record<BannerType, string> = {
  [BannerType.PROMOTIONAL]: 'ترويجي',
  [BannerType.INFORMATIONAL]: 'معلوماتي',
  [BannerType.ANNOUNCEMENT]: 'إعلان',
  [BannerType.ADVERTISEMENT]: 'إعلاني',
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  type: BannerType;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  viewCount: number;
  clickCount: number;
  creationDate?: string;
}

export interface BannerForm {
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  type: number;
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface BannersResponse {
  data: Banner[];
  totalCount: number;
  pageCount: number;
}

export interface TrackBannerRequest {
  bannerId: string;
  interactionType: 'view' | 'click';
}
