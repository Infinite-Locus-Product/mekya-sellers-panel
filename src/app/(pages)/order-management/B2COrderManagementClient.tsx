"use client";

import {
    OrderManagementSegmentClient,
    type OrderManagementSegmentClientProps,
} from "./OrderManagementSegmentClient";

export type B2COrderManagementClientProps = Omit<
    OrderManagementSegmentClientProps,
    "segment"
>;

export function B2COrderManagementClient(props: Readonly<B2COrderManagementClientProps>) {
    return <OrderManagementSegmentClient {...props} segment="b2c" />;
}

