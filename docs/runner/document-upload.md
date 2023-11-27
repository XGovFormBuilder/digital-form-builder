# Document upload

the form builder supports the use of an external document upload service. This allows users to upload files, but gives developers the flexibility to decide how they want to process the files.

## Setup

In order to start using file upload files in your form, you will need to specify an endpoint to send your files to. This can be done by setting the following environment variables:

| Variable name           | Definition                                             | example                         |
| ----------------------- | ------------------------------------------------------ | ------------------------------- |
| DOCUMENT_UPLOAD_API_URL | the root endpoint of service used to upload your files | https://document-upload-api.com |

The service you're using for your document upload api will need an endpoint of /files that accepts POST requests with a file in the body. Currently, there is no support for authenticating against this endpoint, so this endpoint will need to be open.

### Responses

The upload service which handles communication with the api can handle the following responses:

| Code | Payload          | Handled by                                                                                                                                        |
| ---- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 201  |                  | Updating the value of the upload field to the location url returned                                                                               |
| 201  | `qualityWarning` | Updating the upload field as above, as well as routing to the upload playback page if using the UploadPageController. See below for more details. |
| 400  |                  | Redirects back to the upload field page displaying a file type error                                                                              |
| 413  |                  | Redirects back to the upload field page displaying a file size error                                                                              |
| 422  |                  | Redirects back to the upload field page displaying a file virus error                                                                             |

#### UploadPageController

We have introduced a specific UploadPageController, which can be used if you want to integrate image quality checking into your document upload api.
By adding the property `controller: UploadPageController` to the page in your form json, if a successful response is returned from the api but with the payload "qualityWarning", the user will be presented a playback page.
This page will strongly suggest the user upload a new image, and give the user the option to continue anyway or upload a new image.
If the UploadPageController is not specified on the page, the quality warning will be ignored, and the user will be routed to the next page in the form as normal.
