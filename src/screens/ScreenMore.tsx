import { ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { CollapsibleSection } from "../components/CollapsibleSection";
import { Divider } from "../components/Divider";
import { ExternalLink } from "../components/ExternalLink";
import { FancyText } from "../components/FancyText";
import { Flex } from "../components/Flex";
import { RadioGroup } from "../components/RadioGroup";
import { Select } from "../components/Select";
import { TranslationCard } from "../components/TranslationCard";
import { useAppContext } from "../hooks/useAppContext";
import { useGeneration } from "../hooks/useGeneration";
import { useLanguage } from "../hooks/useLanguage";
import { useTheme } from "../hooks/useTheme";
import { useTypeCount } from "../hooks/useTypeCount";
import { compare } from "../misc/compare";
import { generations, isGeneration } from "../misc/data-generations";
import {
  getDesiredLanguage,
  isLang,
  supportedLanguages,
} from "../misc/detectLanguage";
import { fail } from "../misc/fail";
import {
  formatLanguageCompletion,
  languageBounty,
  languageCompletions,
  officialLanguages,
  officialLanguagesSet,
  showLang,
  unofficialLanguages,
} from "../misc/lang";
import { resetApp } from "../misc/resetApp";

export function ScreenMore(): ReactNode {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <main className="content-narrow center">
      <Flex direction="column" padding="large">
        {/* Example for "helpMeTranslate" section */}
        {t("more.helpMeTranslate.heading") && (
          <CollapsibleSection
            heading={
              <FancyText inline tag="h2" fontSize="xlarge" fontWeight="medium">
                {t("more.helpMeTranslate.heading")}
              </FancyText>
            }
          >
            <FancyText tag="p">{t("more.helpMeTranslate.description")}</FancyText>
          </CollapsibleSection>
        )}

        {/* Repeat similar checks for other sections */}
        {t("more.whatsNew.heading") && (
          <CollapsibleSection
            heading={
              <FancyText inline tag="h2" fontSize="xlarge" fontWeight="medium">
                {t("more.whatsNew.heading")}
              </FancyText>
            }
          >
            <FancyText tag="p">{t("more.whatsNew.description")}</FancyText>
          </CollapsibleSection>
        )}

        {/* Add similar conditional rendering for other sections */}
      </Flex>
    </main>
  );
}
