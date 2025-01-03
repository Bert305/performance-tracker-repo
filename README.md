# Metrics Performance Tracker


<h1>Start Server: $npm run start</h1>
<br/>
<hr/>
<h1>What this does</h1>
<p>As a user I can create an account, log in, and join a team.</p>
<p>I can create tasks and assign metrics to calculate my performance</p>
<p>As a user I can see the stats of my other team members as well</p>
<p></p>
<p>Use Postman to create an account and send requests</p>
<p></p>
<p><strong>Tech stack: </strong> Node.js and Express.js</p>
<p></p>
<p></p>
<p><strong>Your Environment Variables Phase 1:</strong></p>
<p> <strong>PORT</strong>=5000</p>
<p>
  <strong>
  NODE_ENV = development
</p>
    </strong>
<p>
   <strong>
  DB_CONNECTION=Your MongoDB connection string
    </strong>
</p>
<p></p>
<p>Next steps are to use Postman to create requests using a Trello API to track metrics.</p>
<p>Create a Trello Account that allows you to use an API Key and Token</p>
<p>Once you have those 2 things you can know to use Postman to create requests in order to render data from your Trello Board or Card</p>
<p>Use this link for documentation on Trello APIs here: <a href="https://developer.atlassian.com/cloud/trello/rest/api-group-actions/#api-group-actions">Get Action of Trello Boards and Cards</a></p>
<p>Next steps are to create a webhook with an endpoint so that you can get updated on when a card moves from list A to list B using this link: <a href="https://developer.atlassian.com/cloud/trello/rest/api-group-webhooks/#api-group-webhooks">Trello API Web-hook documentation</a></p>
<p>Make sure to deploy the web application using heroku</p>
<p>Once deployed you can use Heroku logs to see if the webhook hits in order to track card movements date, time, and hours</p>
<p><strong>Your Environment Variables Phase 2:</strong></p>
<p>
   <strong>
  TRELLO_API_KEY=Your Trello API Key
    </strong>
</p>
<p>
   <strong>
 TRELLO_TOKEN=Your Trello Token
    </strong>
</p>
<p>
   <strong>
  BOARD_ID=Your Board ID
    </strong>
</p>
<p>
   <strong>
  BASE_URL=ID_Model of Trello Board or Trello Card
    </strong>
</p>
<p>
   <strong>
 ID=Web-hook ID
    </strong>
</p>



