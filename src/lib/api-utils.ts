import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
}

export function successResponse<T>(data: T, meta?: ApiResponse["meta"]): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (meta) response.meta = meta;
  return NextResponse.json(response);
}

export function errorResponse(error: string, status: number = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function createdResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message: message || "Created successfully",
    },
    { status: 201 }
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  return successResponse(data, {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}