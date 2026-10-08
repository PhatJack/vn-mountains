import { Mountain, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

interface MountainEmptyProps {
  onAddMountain: () => void;
}

export default function MountainEmpty({ onAddMountain }: MountainEmptyProps) {
  const t = useTranslations("sidebar");

  return (
    <Empty className="border border-dashed px-4 py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Mountain />
        </EmptyMedia>
        <EmptyTitle>{t("addMountain")}</EmptyTitle>
        <EmptyDescription>{t("addMountainDescription")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" onClick={onAddMountain} className="w-full">
          <Plus />
          {t("addMountainCta")}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
