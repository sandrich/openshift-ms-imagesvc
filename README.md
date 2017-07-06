# openshift-ms-imagesvc
This package offers a REST Api to resize an image and upload it to Google Storage.

## TODO
* Tests

## Install on OpenShift
1. Create a [bucket](https://console.cloud.google.com/storage)
2. Create a [service account](https://console.cloud.google.com/apis/credentials) key. Download the json file.
3. Create secret with ```oc create secret generic gcsimageupload-secret --from-file=keyfile.json```
4. Import and run template with ```oc new-app --file=./template/imagesvc.yml -p GCS_PROJECT_ID=project-id -p GCS_BUCKET=bucket-name```

## Environment variables
**IMAGINARY_APPLICATION_DOMAIN (required)**

Url to the Imaginary service.

Example ```IMAGINARY_APPLICATION_DOMAIN=http://localhost:9000```

**MAX_BODY_SIZE (optional)**

Max upload size in bytes.
