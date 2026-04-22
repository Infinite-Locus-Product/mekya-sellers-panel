"use client";
import {
    OrderManagementSegmentClient,
    type OrderManagementSegmentClientProps,
} from "./OrderManagementSegmentClient";

export type B2BOrderManagementClientProps = Omit<
    OrderManagementSegmentClientProps,
    "segment"
>;

export function B2BOrderManagementClient(props: Readonly<B2BOrderManagementClientProps>) {
    return <OrderManagementSegmentClient {...props} segment="b2b" />;
}
