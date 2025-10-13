import React, { useEffect, useState } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import useCustomFieldsWithPermissions from 'api/custom_fields_with_permissions/useCustomFieldsWithPermissions';
import useAuthUser from 'api/me/useAuthUser';

import {
  AuthenticationData,
  SetError,
} from 'containers/Authentication/typings';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import UserCustomFieldsForm from 'components/UserCustomFields';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import tracks from '../../tracks';

import messages from './messages';

interface Props {
  authenticationData: AuthenticationData;
  loading: boolean;
  setError: SetError;
  onSubmit: (id: string, formData: Record<string, any>) => Promise<void>;
  onSkip: () => void;
}

const CustomFields = ({
  authenticationData,
  loading,
  setError,
  onSubmit,
  onSkip,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { data: customFields } = useCustomFieldsWithPermissions(
    authenticationData.context
  );
  const smallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const [_formData, setFormData] = useState<Record<string, any>>({});
  const [triggerCustomFieldsValidation, setTriggerCustomFieldsValidation] =
    useState(false);
  const [validationInProgress, setValidationInProgress] = useState(false);

  useEffect(() => {
    trackEventByName(tracks.signUpCustomFieldsStepEntered);
  }, []);

  if (!authUser || !customFields) {
    return null;
  }

  const handleSubmit = async () => {
    setValidationInProgress(true);
    setTriggerCustomFieldsValidation(true);
  };

  const handleCustomFieldsValidation = async (isValid: boolean) => {
    setTriggerCustomFieldsValidation(false);
    setValidationInProgress(false);

    if (!isValid) {
      return;
    }

    try {
      await onSubmit(authUser.data.id, _formData);
    } catch (e) {
      setError('unknown');
    }
  };
  const allowSkip =
    !customFields.some((field) => field.required) &&
    !customFields.some((field) => field.constraints?.locked === true);

  return (
    <Box
      w="100%"
      pb={smallerThanPhone ? '14px' : '28px'}
      id="e2e-signup-custom-fields-container"
    >
      <UserCustomFieldsForm
        authenticationContext={authenticationData.context}
        onChange={setFormData}
        triggerValidation={triggerCustomFieldsValidation}
        onValidationResult={handleCustomFieldsValidation}
      />

      <Box
        display="flex"
        flexDirection={smallerThanPhone ? 'column' : undefined}
        alignItems={smallerThanPhone ? 'stretch' : 'center'}
        justifyContent={smallerThanPhone ? 'center' : 'space-between'}
      >
        <ButtonWithLink
          id="e2e-signup-custom-fields-submit-btn"
          processing={loading || validationInProgress}
          disabled={loading || validationInProgress}
          text={formatMessage(messages.continue)}
          onClick={handleSubmit}
        />

        {allowSkip && (
          <ButtonWithLink
            id="e2e-signup-custom-fields-skip-btn"
            buttonStyle="text"
            padding="0"
            textDecoration="underline"
            textDecorationHover="underline"
            processing={loading}
            onClick={onSkip}
            mt={smallerThanPhone ? '20px' : undefined}
            mb={smallerThanPhone ? '16px' : undefined}
          >
            {formatMessage(messages.skip)}
          </ButtonWithLink>
        )}
      </Box>
    </Box>
  );
};

export default CustomFields;
