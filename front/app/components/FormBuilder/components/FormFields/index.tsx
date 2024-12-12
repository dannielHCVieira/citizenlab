import React, { memo, useMemo } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import {
  useFieldArray,
  useFormContext,
  UseFormSetValue,
  UseFormTrigger,
  useWatch,
} from 'react-hook-form';

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

import useLocale from 'hooks/useLocale';

import {
  builtInFieldKeys,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';

import { isNilOrError } from 'utils/helperUtils';

import { DragAndDropResult, NestedGroupingStructure } from '../../edit/utils';
import { DragAndDrop, Drag, Drop } from '../DragAndDrop';
import { getFieldNumbers } from '../utils';

import FormField from './FormField';

export const pageDNDType = 'droppable-page';
export const questionDNDType = 'droppable-question';

interface FormFieldsProps {
  // formCustomFields: IFlatCustomFieldWithIndex[];
  onEditField: (field: IFlatCustomField) => void;
  handleDragEnd: (
    result: DragAndDropResult,
    nestedGroupData: NestedGroupingStructure[]
  ) => void;
  selectedFieldId?: string;
  builderConfig: FormBuilderConfig;
  closeSettings: (triggerAutosave?: boolean) => void;
  trigger: UseFormTrigger<{
    customFields: IFlatCustomFieldWithIndex[];
  }>;
  setValue: UseFormSetValue<{
    customFields: IFlatCustomFieldWithIndex[];
  }>;
}

const FormFields = memo(
  ({
    // formCustomFields,
    onEditField,
    selectedFieldId,
    handleDragEnd,
    builderConfig,
    closeSettings,
    trigger,
    setValue,
  }: FormFieldsProps) => {
    // const { watch, trigger, setValue } = useFormContext();
    const { watch } = useFormContext();
    const locale = useLocale();
    const customFields: IFlatCustomFieldWithIndex[] = watch('customFields');
    const formCustomFields = useMemo(() => customFields, [customFields]);
    const fieldNumbers = useMemo(
      () => getFieldNumbers(formCustomFields),
      [formCustomFields]
    );
    console.warn('Rerendering FormFields');

    // const nestedGroupData = useMemo(() => {
    //   const groups: NestedGroupingStructure[] = [];
    //   console.warn('computing nestedGroupData');

    //   formCustomFields.forEach((field) => {
    //     if (['page', 'section'].includes(field.input_type)) {
    //       groups.push({
    //         groupElement: field,
    //         questions: [],
    //         id: field.id,
    //       });
    //     } else {
    //       const lastGroupElement = groups[groups.length - 1];
    //       lastGroupElement.questions.push({ ...field, index: lastGroupElement.questions.length });
    //     }
    //   });

    //   return groups;
    // }, [formCustomFields]);

    if (isNilOrError(locale)) {
      return null;
    }

    const shouldShowField = (field: IFlatCustomField) => {
      if (builtInFieldKeys.includes(field.key)) {
        return field.enabled;
      }
      return true;
    };

    const nestedGroupData: NestedGroupingStructure[] = [];

    formCustomFields.forEach((field) => {
      if (['page', 'section'].includes(field.input_type)) {
        nestedGroupData.push({
          groupElement: field,
          questions: [],
          id: field.id,
        });
      } else {
        const lastGroupElement = nestedGroupData[nestedGroupData.length - 1];
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        lastGroupElement?.questions.push({
          ...field,
        });
      }
    });

    // const fieldNumbers = getFieldNumbers(formCustomFields);

    // return (
    //   <Box height="100%" data-cy="e2e-form-fields">
    //     <Box>
    //       <Box>
    //         {nestedGroupData.map((grouping, pageIndex) => {

    //           return (
    //             <Box key={grouping.id} id={grouping.id}>
    //               <FormField
    //                 field={grouping.groupElement}
    //                 selectedFieldId={selectedFieldId}
    //                 onEditField={onEditField}
    //                 builderConfig={builderConfig}
    //                 fieldNumbers={fieldNumbers}
    //                 closeSettings={closeSettings}
    //                 trigger={trigger}
    //                 setValue={setValue}
    //               />
    //               <Box key={grouping.id} id={grouping.id}>
    //                 <Box height="100%">
    //                   {grouping.questions.length === 0 ? (
    //                     <Box height="0.5px" />
    //                   ) : (
    //                     <>
    //                       {grouping.questions.map((question, index) => {
    //                         return shouldShowField(question) ? (
    //                           <Box
    //                             key={question.id}
    //                           >
    //                             <FormField
    //                               key={question.id}
    //                               field={question}
    //                               selectedFieldId={selectedFieldId}
    //                               onEditField={onEditField}
    //                               builderConfig={builderConfig}
    //                               fieldNumbers={fieldNumbers}
    //                               closeSettings={closeSettings}
    //                               trigger={trigger}
    //                               setValue={setValue}
    //                             />
    //                           </Box>
    //                         ) : (
    //                           <Box key={question.id} height="1px" />
    //                         );
    //                       })}
    //                     </>
    //                   )}
    //                 </Box>
    //               </Box>
    //             </Box>
    //           );
    //         })}
    //       </Box>
    //     </Box>
    //     {formCustomFields.length > 0 && (
    //       <Box height="1px" borderTop={`1px solid ${colors.divider}`} />
    //     )}
    //   </Box>
    // );

    const onDragEnd = (result: DragAndDropResult) => {
      handleDragEnd(result, nestedGroupData);
      trigger();
    };

    return (
      <Box height="100%" data-cy="e2e-form-fields">
        <DragAndDrop onDragEnd={onDragEnd}>
          <Drop id="droppable" type={pageDNDType}>
            {nestedGroupData.map((grouping, pageIndex) => {
              return (
                <Drag key={grouping.id} id={grouping.id} index={pageIndex}>
                  <FormField
                    field={grouping.groupElement}
                    selectedFieldId={selectedFieldId}
                    onEditField={onEditField}
                    builderConfig={builderConfig}
                    fieldNumbers={fieldNumbers}
                    closeSettings={closeSettings}
                    trigger={trigger}
                    setValue={setValue}
                  />
                  <Drop
                    key={grouping.id}
                    id={grouping.id}
                    type={questionDNDType}
                  >
                    <Box height="100%">
                      {grouping.questions.length === 0 ? (
                        <Box height="0.5px" />
                      ) : (
                        <>
                          {grouping.questions.map((question, index) => {
                            return shouldShowField(question) ? (
                              <Drag
                                key={question.id}
                                id={question.id}
                                index={index}
                              >
                                <FormField
                                  key={question.id}
                                  field={question}
                                  selectedFieldId={selectedFieldId}
                                  onEditField={onEditField}
                                  builderConfig={builderConfig}
                                  fieldNumbers={fieldNumbers}
                                  closeSettings={closeSettings}
                                  trigger={trigger}
                                  setValue={setValue}
                                />
                              </Drag>
                            ) : (
                              <Box key={question.id} height="1px" />
                            );
                          })}
                        </>
                      )}
                    </Box>
                  </Drop>
                </Drag>
              );
            })}
          </Drop>
        </DragAndDrop>
        {formCustomFields.length > 0 && (
          <Box height="1px" borderTop={`1px solid ${colors.divider}`} />
        )}
      </Box>
    );
  }
);

FormFields.whyDidYouRender = {
  logOnDifferentValues: true,
  customName: 'FormFields',
};

export default FormFields;
