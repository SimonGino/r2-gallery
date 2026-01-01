export interface R2Object {
  key: string;
  last_modified: string;
  size: number;
  url: string;
  width?: number; // Image width in pixels
  height?: number; // Image height in pixels
}

export interface ImageListResponse {
  items: R2Object[];
  has_more: boolean;
  total?: number; // 可选：总数
  current_page?: number; // 可选：当前页码
}

export interface ImageListParams {
  page_size?: number;
  page: number;
}
