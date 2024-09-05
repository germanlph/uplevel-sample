import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
var app = express();
app.use(bodyParser.json());
var BASE_URL = 'https://api.github.com';

//const octokit = new Octokit({ auth: process.env.PERSONAL_TOKEN });

async function evaluatePullRequests(recordCount = 25) {
  const pullsData = await fetch(
    `${BASE_URL}/repos/${process.env.OWNER}/${process.env.REPOSITORY}/pulls?state=all&per_page=${recordCount}&page=1&sort=created`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${process.env.PERSONAL_TOKEN}`,
      },
    }
  ).then((r) => r.json());

  var allPulls = pullsData ?? [];
  if (allPulls.length) {
    for (var i = 0; i < allPulls.length; i++) {
      const prDetails = await fetch(
        `${BASE_URL}/repos/${process.env.OWNER}/${process.env.REPOSITORY}/pulls/${allPulls[i].number}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            Authorization: `Bearer ${process.env.PERSONAL_TOKEN}`,
          },
        }
      ).then((r) => r.json());
      allPulls[i].prDetails = prDetails;
    }

    var plural = allPulls.length > 1 ? 'were' : 'was';
    console.log(`${allPulls.length} ${plural} found for this report.\n`);

    const currentDate = new Date();
    const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000);

    // Evaluate all opened and closed this week
    var openThisWeek =
      allPulls.filter((pr) => new Date(pr['created_at']) > lastWeek) ?? [];
    console.log(`Of those PRs ${openThisWeek.length} were opened this week.`);
    var closedThisWeek =
      allPulls.filter(
        (pr) => pr['closed_at'] !== null && new Date(pr['closed_at'] > lastWeek)
      ) ?? [];
    console.log(
      `Of those PRs ${closedThisWeek.length} were closed this week.\n`
    );

    // Evaluate all PRs that have been open for more than one day
    var longLived =
      allPulls.filter(
        (pr) => pr.state == 'open' && new Date(pr['created_at']) < oneDayAgo
      ) ?? [];

    console.log(
      `${longLived.length} were found to be more than one day old${
        longLived.length ? ':' : '.'
      }\n`
    );
    longLived.forEach((pr) => {
      console.log(
        `PR Number: ${pr.number}\nPR Title: ${pr.title}\nPR Author: ${pr.user.login}.\n\n`
      );
    });

    // Evaluate all PRs sizes
    var largePRs =
      allPulls.filter(
        (pr) =>
          (pr.prDetails != null && pr.prDetails.additions > 50) ||
          pr.prDetails.deletions > 50 ||
          pr.prDetails.changes_files > 5
      ) ?? [];
    var smallPRs =
      allPulls.filter(
        (pr) =>
          pr.prDetails != null &&
          pr.prDetails.additions <= 50 &&
          pr.prDetails.deletions <= 50 &&
          pr.prDetails.changes_files < 5
      ) ?? [];
    console.log(
      `${largePRs.length} large PRs were found.`
    );
    console.log(
      `${smallPRs.length} small PRs were found.`
    );
  }
}

app.listen(3000, async () => {
  var recordCount = process.env.npm_config_count;
  if (isNaN(recordCount)) {
    recordCount = 25;
  }
  console.log(`Generating Github Report...\n`);
  await evaluatePullRequests(recordCount);
});
