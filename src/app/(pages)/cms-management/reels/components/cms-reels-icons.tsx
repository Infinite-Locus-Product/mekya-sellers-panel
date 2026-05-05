import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

const stroke = 1.5;

/** 24×24 outline icons — stroke via `currentColor` (brand #004C5E in table actions). */
function IconShell({
  className,
  children,
  ...rest
}: Readonly<SVGProps<SVGSVGElement> & { children: ReactNode }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("shrink-0", className)}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function CmsReelIconEdit(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function CmsReelIconEye(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function CmsReelIconTrash(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path d="M3 6h18" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      <path
        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </IconShell>
  );
}

export function CmsReelIconChart(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path
        d="M4 21V10M12 21V3M20 21v-8"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function CmsReelIconUpload(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path
        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function CmsReelIconClose(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path
        d="M6 18 18 6M6 6l12 12"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

export function CmsReelIconArrowLeft(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path
        d="M15 18 9 12l6-6"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

/** Plus — matches Heroicons outline style */
export function CmsReelIconPlus(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path
        d="M12 4.5v15m7.5-7.5h-15"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

/** Check — success / confirmation */
export function CmsReelIconCheck(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path
        d="m20 6-11 11-5-5"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

/** Warning triangle — destructive / confirm dialogs */
export function CmsReelIconAlertTriangle(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <IconShell {...props}>
      <path
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconShell>
  );
}

/** 28×28 filled icons — edit-reel stepper (design SVG export) */
function EditReelFlowIconShell({
  className,
  children,
  ...rest
}: Readonly<SVGProps<SVGSVGElement> & { children: ReactNode }>) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("shrink-0", className)}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function EditReelStepIconCrop(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <EditReelFlowIconShell {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.77324 8.37021C1.77324 9.13757 2.07807 9.8735 2.62067 10.4161C3.16328 10.9587 3.89921 11.2635 4.66657 11.2635C5.43393 11.2635 6.16986 10.9587 6.71247 10.4161C7.25507 9.8735 7.5599 9.13757 7.5599 8.37021C7.5599 7.60285 7.25507 6.86692 6.71247 6.32431C6.16986 5.78171 5.43393 5.47688 4.66657 5.47688C3.89921 5.47688 3.16328 5.78171 2.62067 6.32431C2.07807 6.86692 1.77324 7.60285 1.77324 8.37021ZM4.66657 12.9435C3.6874 12.9434 2.73411 12.6291 1.94696 12.0467C1.15982 11.4643 0.580372 10.6446 0.293881 9.70829C0.00739054 8.77197 0.0289812 7.76842 0.355476 6.84528C0.681972 5.92214 1.29613 5.12817 2.1076 4.58017C2.91906 4.03217 3.88499 3.75908 4.86326 3.80109C5.84153 3.84309 6.7805 4.19796 7.54201 4.8135C8.30352 5.42903 8.84736 6.27273 9.09353 7.22045C9.3397 8.16818 9.27519 9.16989 8.9095 10.0782L10.709 11.2803L10.6716 11.4073L10.3842 12.4339L9.72524 12.8745L7.86977 11.635C7.0447 12.4433 5.9135 12.9435 4.66657 12.9435ZM1.77324 19.5982C1.77324 18.8309 2.07807 18.0949 2.62067 17.5523C3.16328 17.0097 3.89921 16.7049 4.66657 16.7049C5.43393 16.7049 6.16986 17.0097 6.71247 17.5523C7.25507 18.0949 7.5599 18.8309 7.5599 19.5982C7.5599 20.3656 7.25507 21.1015 6.71247 21.6441C6.16986 22.1867 5.43393 22.4915 4.66657 22.4915C3.89921 22.4915 3.16328 22.1867 2.62067 21.6441C2.07807 21.1015 1.77324 20.3656 1.77324 19.5982ZM4.66657 15.0249C3.68826 15.025 2.73576 15.3388 1.94898 15.9203C1.16221 16.5017 0.582621 17.3201 0.295354 18.2553C0.00808638 19.1905 0.0282796 20.1932 0.352967 21.116C0.677655 22.0389 1.28972 22.8333 2.09927 23.3826C2.90882 23.9319 3.87318 24.2071 4.85071 24.1679C5.82823 24.1286 6.7674 23.7769 7.53026 23.1644C8.29313 22.5519 8.83948 21.7109 9.08908 20.765C9.33867 19.819 9.27835 18.818 8.91697 17.9089L27.9999 5.14461L26.2247 5.33128C23.7213 5.5947 21.2971 6.36172 19.0978 7.58621L13.3578 10.7782C13.1422 10.8986 12.9527 11.0606 12.8002 11.2548C12.6476 11.449 12.5352 11.6715 12.4692 11.9094L11.997 13.6006L7.8847 16.3502C7.02973 15.4998 5.87243 15.0232 4.66657 15.0249ZM13.3354 17.1995L13.3578 17.2126L19.0978 20.4046C21.2971 21.6291 23.7213 22.3961 26.2247 22.6595L27.9999 22.8462L16.4452 15.1182L13.3354 17.1995Z"
        fill="currentColor"
      />
    </EditReelFlowIconShell>
  );
}

export function EditReelStepIconCaptions(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <EditReelFlowIconShell {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.625 1.75C2.39294 1.75 2.17038 1.84219 2.00628 2.00628C1.84219 2.17038 1.75 2.39294 1.75 2.625V9.625C1.75 9.85706 1.84219 10.0796 2.00628 10.2437C2.17038 10.4078 2.39294 10.5 2.625 10.5C2.85706 10.5 3.07962 10.4078 3.24372 10.2437C3.40781 10.0796 3.5 9.85706 3.5 9.625V8.75C3.5 5.25 4.375 3.5 8.75 3.5H11.375C11.6071 3.5 11.8296 3.59219 11.9937 3.75628C12.1578 3.92038 12.25 4.14294 12.25 4.375V22.75C12.25 23.2141 12.0656 23.6592 11.7374 23.9874C11.4092 24.3156 10.9641 24.5 10.5 24.5H7.875C7.64294 24.5 7.42038 24.5922 7.25628 24.7563C7.09219 24.9204 7 25.1429 7 25.375C7 25.6071 7.09219 25.8296 7.25628 25.9937C7.42038 26.1578 7.64294 26.25 7.875 26.25H20.125C20.3571 26.25 20.5796 26.1578 20.7437 25.9937C20.9078 25.8296 21 25.6071 21 25.375C21 25.1429 20.9078 24.9204 20.7437 24.7563C20.5796 24.5922 20.3571 24.5 20.125 24.5H17.5C17.0359 24.5 16.5908 24.3156 16.2626 23.9874C15.9344 23.6592 15.75 23.2141 15.75 22.75V4.375C15.75 4.14294 15.8422 3.92038 16.0063 3.75628C16.1704 3.59219 16.3929 3.5 16.625 3.5H19.25C23.625 3.5 24.5 5.25 24.5 8.75V9.625C24.5 9.85706 24.5922 10.0796 24.7563 10.2437C24.9204 10.4078 25.1429 10.5 25.375 10.5C25.6071 10.5 25.8296 10.4078 25.9937 10.2437C26.1578 10.0796 26.25 9.85706 26.25 9.625V2.625C26.25 2.39294 26.1578 2.17038 25.9937 2.00628C25.8296 1.84219 25.6071 1.75 25.375 1.75H2.625Z"
        fill="currentColor"
      />
    </EditReelFlowIconShell>
  );
}

export function EditReelStepIconDescription(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <EditReelFlowIconShell {...props}>
      <path
        d="M3.20872 19.832H17.7921C18.0137 19.8321 18.2271 19.9163 18.3891 20.0677C18.5511 20.219 18.6496 20.4262 18.6647 20.6474C18.6799 20.8686 18.6105 21.0872 18.4705 21.2592C18.3306 21.4312 18.1307 21.5436 17.9111 21.5739L17.7921 21.582H3.20872C2.98702 21.582 2.77362 21.4977 2.61163 21.3464C2.44963 21.195 2.35113 20.9879 2.33602 20.7667C2.32091 20.5455 2.39032 20.3268 2.53022 20.1548C2.67013 19.9829 2.87009 19.8704 3.08972 19.8402L3.20872 19.832ZM3.20872 15.1654H24.7921C25.0137 15.1654 25.2271 15.2497 25.3891 15.401C25.5511 15.5523 25.6496 15.7595 25.6647 15.9807C25.6799 16.2019 25.6105 16.4206 25.4705 16.5925C25.3306 16.7645 25.1307 16.877 24.9111 16.9072L24.7921 16.9154H3.20872C2.98702 16.9153 2.77362 16.8311 2.61163 16.6797C2.44963 16.5284 2.35113 16.3212 2.33602 16.1C2.32091 15.8788 2.39032 15.6602 2.53022 15.4882C2.67013 15.3162 2.87009 15.2037 3.08972 15.1735L3.20872 15.1654ZM3.20872 10.4987H24.7921C25.0137 10.4988 25.2271 10.583 25.3891 10.7343C25.5511 10.8857 25.6496 11.0929 25.6647 11.3141C25.6799 11.5352 25.6105 11.7539 25.4705 11.9259C25.3306 12.0979 25.1307 12.2103 24.9111 12.2405L24.7921 12.2487H3.20872C2.98702 12.2486 2.77362 12.1644 2.61163 12.0131C2.44963 11.8617 2.35113 11.6545 2.33602 11.4333C2.32091 11.2122 2.39032 10.9935 2.53022 10.8215C2.67013 10.6495 2.87009 10.5371 3.08972 10.5069L3.20872 10.4987ZM3.20872 5.83203H24.7921C25.0137 5.8321 25.2271 5.91632 25.3891 6.06767C25.5511 6.21902 25.6496 6.42621 25.6647 6.64739C25.6799 6.86857 25.6105 7.08724 25.4705 7.25921C25.3306 7.43119 25.1307 7.54365 24.9111 7.57386L24.7921 7.58203H3.20872C2.98702 7.58196 2.77362 7.49775 2.61163 7.3464C2.44963 7.19505 2.35113 6.98785 2.33602 6.76667C2.32091 6.54549 2.39032 6.32682 2.53022 6.15485C2.67013 5.98287 2.87009 5.87042 3.08972 5.8402L3.20872 5.83203Z"
        fill="currentColor"
      />
    </EditReelFlowIconShell>
  );
}

export function EditReelStepIconThumbnail(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <EditReelFlowIconShell {...props}>
      <path
        d="M5.83333 24.5C5.19167 24.5 4.64256 24.2717 4.186 23.8152C3.72944 23.3586 3.50078 22.8091 3.5 22.1667V5.83333C3.5 5.19167 3.72867 4.64256 4.186 4.186C4.64333 3.72944 5.19244 3.50078 5.83333 3.5H22.1667C22.8083 3.5 23.3578 3.72867 23.8152 4.186C24.2725 4.64333 24.5008 5.19244 24.5 5.83333V22.1667C24.5 22.8083 24.2717 23.3578 23.8152 23.8152C23.3586 24.2725 22.8091 24.5008 22.1667 24.5H5.83333ZM5.83333 22.1667H22.1667V5.83333H5.83333V22.1667ZM8.16667 19.8333H19.8333C20.0667 19.8333 20.2417 19.7264 20.3583 19.5125C20.475 19.2986 20.4556 19.0944 20.3 18.9L17.0917 14.6125C16.975 14.4569 16.8194 14.3792 16.625 14.3792C16.4306 14.3792 16.275 14.4569 16.1583 14.6125L13.125 18.6667L10.9667 15.7792C10.85 15.6236 10.6944 15.5458 10.5 15.5458C10.3056 15.5458 10.15 15.6236 10.0333 15.7792L7.7 18.9C7.54444 19.0944 7.525 19.2986 7.64167 19.5125C7.75833 19.7264 7.93333 19.8333 8.16667 19.8333Z"
        fill="currentColor"
      />
    </EditReelFlowIconShell>
  );
}
