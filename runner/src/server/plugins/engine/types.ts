import { StateChangeError } from "aws-sdk/clients/directconnect";

/**
 * Engine State is an object containing the following props:
 * 1. progress[]: which indicates the urls the user have already submitted.
 * 2. Other props contain user's submitted values, format is: { [inputId]: `value` }
 *
 * e.g:
 * {
 *   progress: [
 *     '/gZovGvanSq/student-visa-application?visit=HxCva29Xhd',
 *     '/gZovGvanSq/what-are-you-going-to-study?visit=HxCva29Xhd'
 *   ],
 *   _C9PRHmsgt: 'Ben',
 *   WfLk9McjzX: 'Music',
 *   IK7jkUFCBL: 'Royal Academy of Music'
 * }
 */
export type FormSubmissionState = {
  progress: string[];
  [inputId: string]: any;
};
