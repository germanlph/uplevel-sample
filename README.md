# Sample application for Github Pull Request report

# Technologies and Versions:
  - Node: 18.17.0
  - Npm: 9.6.7

## Specifications:
  - The app will retrieve one of _n_ number of record as specified by the count parameter in the start command.
  - It will evaluate those Pull Request records to determine the following things:
    * How many of them were opened in the last week.
    * How many of them were closed in the last week.
    * How many are still open after more than one day, as this is a long time for a PR to be open... generally.
    * If any such long-lived PRs were found, the app will print information about them.
    * How many were large PRs, meaning they either had more than 50 additions, more than 50 deletions, or more than 5 file changes.
    * How many were small PRs, meaning they had fewer than 51 additions and deletions, and fewer than 6 file changes.

## Setup:
  - Create `.env` file at the root of the project and add the following values
    * PERSONAL_TOKEN=_token-value_ - this token must be generated in the Developer Settings of your github personal account.
    * OWNER=_owner-name_ - the name of the owner of the repository you wish to report on.
    * REPOSITORY=_repository-name_ - the name of the repository you wish to report on.

## Running application:
  - At the root of the project run `npm install`
  - Run `npm --count=n run start` where _n_ is the number of records to evaluate. If no count is provided, or if the count is not a number, the application will use the default of 25. This is in place to prevent over-processing on a repository that has a large number of Pull Requests