# **BETA TEST PLAN – VIGILART**

## **1. Project context**
VigilArt is a mobile and web application that helps artists track where their artworks appear online. Artists upload their artworks, and VigilArt regularly identifies and reports online reposts. When unauthorized use is detected, VigilArt helps them take action by generating DMCA takedown notices.

## **2. User role**
The following roles will be involved in beta testing.

| **Role Name**  | **Description** |
|--------|----------------------|
| Artist        | A user who wants to monitor their artworks. |

---

## **3. Feature table**
The following features will be shown during the defense.

| **Feature ID** | **User role** | **Feature name** | **Short description** |
|--------------|---------------|-------------------------|--------------------------------------|
| F1 | Artist | Sign up | Sign up with an email and password. |
| F2 | Artist | Login | Login with an existing account. |
| F3 | Artist | View profile | View account info. |
| F4 | Artist | Update profile | Update account info. |
| F5 | Artist | Delete account | Delete account. |
| F6 | Artist | Upload artwork | Upload an artwork to the application.  |
| F7 | Artist | View artworks | View the uploaded artworks. |
| F8 | Artist | Get artwork info | View information related to a specific artwork. |
| F9 | Artist | Update artwork info | Update a specific artwork info. |
| F10 | Artist | Delete artwork | Delete a specific artwork. |
| F11 | Artist | Generate artworks report | Detects new reposts and reports them immediately. |
| F12 | Artist | View all matches | View all detected reposts of your uploaded artworks (based on all reports to date). |
| F13 | Artist | View new matches  | View newly detected reposts i.e. from the latest report. |
| F14 | Artist | View global statistics | View statistics based on all detected reposts e.g. the total number of reposts. |
| F15 | Artist | View latest report statistics | View statistics based on the latest report. |
| F16 | Artist | View artwork matches | View all matches of a specific artwork. |
| F17 | Artist | View artwork new matches | View newly detected matches of a specific artwork. |
| F18 | Artist | View artwork match info | View a match info e.g. the page URL. |
| F19 | Artist | Sort matches | Sort matches e.g. by the website category. |
| F20 | Artist | Filter matches | Filter matches e.g. by the website category, the report date... |
| F21 | Artist | Generate DMCA takedown notice | Generate a DMCA takedown notice based on a detected repost and the platform where the repost was detected. |
| F22 | Artist | Redirect to DMCA takedown platform | Redirect the artist to the corresponding platform where the repost was detected. |
| F23 | Artist | Copy generated DMCA takedown notice | The fields of the generated DMCA takedown notice can be copied/pasted. |
| F24 | Artist | Download DMCA takedown notice | The generated DMCA takedown notice can be downloaded in PDF format. |
| F25 | Artist | Edit generated DMCA takedown notice | Edit the content of the generated DMCA takedown notice. |
| F26 | Artist | Receive new report notifications | Receive new report notifications (push or email). |

---

## **4. Success Criteria**
Define the metrics and conditions that determine if the beta version is successful.

**Note:** Since visual search cannot detect new reposts in a few minutes, a random number of matches will be manually added between two generated reports.
A match refers to a detected repost of an artwork.

| Feature ID | Key success criteria                                                                               | Indicator / metric                                           | Result             |
| ---------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------ |
| F1         | A user signs up with an email and password without application errors                              | 20 sign-up attempts, 0 application-related failures          | Achieved           |
| F2         | A registered user can log in successfully                                                          | 20 login attempts, 0 failures                                | Achieved           |
| F3         | Profile information can be accessed                                                                | 10 profile views, no loading errors                          | Achieved           |
| F4         | Profile updates are saved and reflected immediately                                                | 10 updates, all persisted                                    | Achieved           |
| F5         | Account deletion removes user data and access                                                      | 5 deletions tested, no remaining access                      | Achieved           |
| F6         | An artwork can be uploaded and stored correctly                                                    | 15 uploads tested, all visible after upload                  | Achieved           |
| F7         | Uploaded artworks are visible in the artwork list                                                  | 15 artworks uploaded, all listed correctly                   | Achieved           |
| F8         | Artwork information is displayed correctly                                                         | 10 artworks checked, all metadata visible                    | Achieved           |
| F9         | Updating artwork information persists correctly                                                    | 10 updates tested, all saved                                 | Achieved           |
| F10        | Deleting an artwork removes it from the system                                                     | 8 deletions, 0 residual entries                              | Achieved           |
| F11        | Generating an artworks report detects new reposts and makes them immediately available to the user | 10 report generations triggered, all new reposts are visible | Achieved           |
| F12        | Detected reposts from all reports are visible                                                      | 10 reports generated, all matches visible                    | Achieved           |
| F13        | Newly detected reposts are clearly identified                                                      | 10 reports generated, all new matches correctly identified   | Achieved           |
| F14        | Global statistics reflect detected reposts accurately                                              | 10 reports generated, 0 inconsistencies                      | Achieved           |
| F15        | Latest report statistics match report content                                                      | 10 reports verified, 0 inconsistencies                       | Achieved           |
| F16        | Matches are correctly associated with artworks                                                     | 20 matches checked, 7 incorrect links                       | Partially achieved |
| F17        | Newly detected matches per artwork are identifiable                                                | 15 matches checked, 5 incorrect links                        | Partially achieved |
| F18        | Match details (URL, platform) are accessible                                                       | 25 matches tested, 20 accessible                             | Partially achieved |
| F19        | Sorting matches produces correct order                                                             | 10 sorting tests, correct ordering                           | Achieved           |
| F20        | Filtering matches returns expected results                                                         | 15 filter tests, 0 incorrect subsets                         | Achieved           |
| F21        | DMCA notice is generated with relevant data                                                        | 10 notices generated, ~70% fields auto-filled                | Partially achieved |
| F22        | Redirection leads to the correct platform page                                                     | 15 redirects tested, all correct                             | Achieved           |
| F23        | DMCA notice can be copied without content loss                                                     | 10 copy tests, no formatting loss                            | Achieved           |
| F24        | DMCA notice can be downloaded as a PDF                                                             | 10 downloads tested, 1 failure                               | Partially achieved |
| F25        | Generated DMCA notice can be edited                                                 | 10 edits tested, all saved                                   | Achieved           |
| F26        | User receives notifications for new reports                                                        | 10 reports generated, 8 notifications received               | Partially achieved |
