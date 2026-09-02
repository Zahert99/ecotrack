import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function CarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3.75 15.5 5 10.5a2 2 0 0 1 1.9-1.5h10.2A2 2 0 0 1 19 10.5l1.25 5" />
      <path d="M3.75 15.5h16.5v2.25a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V17H6.75v.75a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V15.5Z" />
      <circle cx="7.5" cy="15.5" r="1.25" />
      <circle cx="16.5" cy="15.5" r="1.25" />
    </Icon>
  );
}

export function BusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="4" y="4.5" width="16" height="12" rx="2" />
      <path d="M4 12h16" />
      <circle cx="8" cy="19" r="1.25" />
      <circle cx="16" cy="19" r="1.25" />
    </Icon>
  );
}

export function TrainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="6" y="3.75" width="12" height="13" rx="4" />
      <path d="M6 12.5h12" />
      <circle cx="9" cy="15.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="15" cy="15.5" r="0.75" fill="currentColor" stroke="none" />
      <path d="M8 20.25 6.5 22.5M16 20.25l1.5 2.25" />
    </Icon>
  );
}

export function FlightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 12 3.5 3.5 21 12 3.5 20.5 6 12Zm0 0h9" />
    </Icon>
  );
}

export function MoreVerticalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="5" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.25" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 20.25 4.75 16.5 16 5.25a1.5 1.5 0 0 1 2.12 0l1.13 1.13a1.5 1.5 0 0 1 0 2.12L8 19.75 4 20.25Z" />
      <path d="M14.5 6.75 17.25 9.5" />
    </Icon>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 7.5h14M9.5 7.5V5.75a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7.5M7 7.5l.75 12a1 1 0 0 0 1 .95h6.5a1 1 0 0 0 1-.95L17 7.5" />
      <path d="M10.25 11v6M13.75 11v6" />
    </Icon>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5.5 5.5 18.5 18.5M18.5 5.5 5.5 18.5" />
    </Icon>
  );
}
