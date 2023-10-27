import { useCallback, useRef, useState } from "react";
import { push } from "react-router-redux";
import { t } from "ttag";
import { useDispatch, useSelector } from "metabase/lib/redux";

import type { Settings } from "metabase-types/api";
import type { SettingElement } from "metabase/admin/settings/types";

import { getIsPaidPlan } from "metabase/selectors/settings";
import { getIsEmailConfigured, getIsHosted } from "metabase/setup/selectors";

import { Box, Flex, Stack } from "metabase/ui";
import Breadcrumbs from "metabase/components/Breadcrumbs";
import Button from "metabase/core/components/Button";
import MarginHostingCTA from "metabase/admin/settings/components/widgets/MarginHostingCTA";

import * as MetabaseAnalytics from "metabase/lib/analytics";
import {
  sendTestEmail,
  updateEmailSettings,
  clearEmailSettings,
} from "../../settings";

import SettingsBatchForm from "../SettingsBatchForm";

const BREADCRUMBS = [[t`Email`, "/admin/settings/email"], [t`SMTP`]];

const SEND_TEST_BUTTON_STATES = {
  default: t`Send test email`,
  working: t`Sending...`,
  success: t`Sent!`,
};
type ButtonStateType = keyof typeof SEND_TEST_BUTTON_STATES;

interface SMTPConnectionFormProps {
  elements: SettingElement[];
  settingValues: Settings;
}

export const SMTPConnectionForm = ({
  elements,
  settingValues,
}: SMTPConnectionFormProps) => {
  const [sendingEmail, setSendingEmail] = useState<ButtonStateType>("default");

  const formRef = useRef();
  const isHosted = useSelector(getIsHosted);
  const isPaidPlan = useSelector(getIsPaidPlan);
  const isEmailConfigured = useSelector(getIsEmailConfigured);

  const dispatch = useDispatch();

  const handleClearEmailSettings = useCallback(async () => {
    await dispatch(clearEmailSettings());
    // NOTE: reaching into form component is not ideal

    formRef.current.setState({ formData: {}, dirty: false });
  }, [dispatch]);

  const handleUpdateEmailSettings = useCallback(
    async formData => {
      await dispatch(updateEmailSettings(formData));

      if (!isEmailConfigured) {
        dispatch(push("/admin/settings/email"));
      }
    },
    [dispatch, isEmailConfigured],
  );

  const handleSendTestEmail = useCallback(
    async e => {
      e.preventDefault();

      setSendingEmail("working");
      // NOTE: reaching into form component is not ideal
      formRef.current.setFormErrors(null);

      try {
        await dispatch(sendTestEmail());
        setSendingEmail("success");
        MetabaseAnalytics.trackStructEvent(
          "Email Settings",
          "Test Email",
          "success",
        );

        // show a confirmation for 3 seconds, then return to normal
        setTimeout(() => setSendingEmail("default"), 3000);
      } catch (error) {
        MetabaseAnalytics.trackStructEvent(
          "Email Settings",
          "Test Email",
          "error",
        );
        setSendingEmail("default");
        // NOTE: reaching into form component is not ideal
        formRef.current.setFormErrors(formRef.current.handleFormErrors(error));
      }
    },
    [dispatch],
  );

  if (isHosted) {
    dispatch(push("/admin/settings/email"));
  }

  return (
    <Stack spacing="sm">
      <Box ml="1rem">
        {isEmailConfigured && <Breadcrumbs crumbs={BREADCRUMBS} />}
      </Box>
      <Flex justify="space-between">
        <SettingsBatchForm
          ref={formRef}
          elements={elements}
          settingValues={settingValues}
          disable={sendingEmail !== "default"}
          updateSettings={handleUpdateEmailSettings}
          renderExtraButtons={({ disabled, valid, pristine, submitting }) => (
            <>
              {valid && pristine && submitting === "default" ? (
                <Button
                  className="mr1"
                  success={sendingEmail === "success"}
                  disabled={disabled}
                  onClick={handleSendTestEmail}
                >
                  {SEND_TEST_BUTTON_STATES[sendingEmail]}
                </Button>
              ) : null}
              <Button
                className="mr1"
                disabled={disabled}
                onClick={handleClearEmailSettings}
              >
                {t`Clear`}
              </Button>
            </>
          )}
        />
        {!isPaidPlan && (
          <MarginHostingCTA tagline={t`Have your email configured for you.`} />
        )}
      </Flex>
    </Stack>
  );
};
