import { FC } from "react";

export const Navbar: FC = () => {
  return (
    <div className="flex h-[50px] sm:h-[60px] border-b border-neutral-300 py-2 px-2 sm:px-8 items-center justify-between">
      <div className="font-bold text-3xl flex items-center">
        <a className="flex gap:10 ai:center jc:center h:50" href="https://nhy.1998.vn">
          NHY
        </a>
      </div>
    </div>
  );
};
