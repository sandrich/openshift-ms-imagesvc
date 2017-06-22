# openshift-ms-imagesvc
This package offers a REST Api to resize an image and upload it to Google Storage.

## TODO
* Tests
* File upload to GCS
* OpenShift template

## Dependencies
* Imaginary TODO
* FileUpload TODO

## Environment variables
**IMAGINARY_APPLICATION_DOMAIN (required)**

Url to the Imaginary service.

Example ```IMAGINARY_APPLICATION_DOMAIN=http://localhost:9000```

**MAX_BODY_SIZE (optional)**

Max upload size in bytes.
