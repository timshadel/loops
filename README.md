# Loops

![A bowl of Fruit Loops][loops]

Use Heroku to trigger Heroku to build, test and deploy to Heroku.

[loops]: http://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Froot_loops_in_a_bowl.jpg/320px-Froot_loops_in_a_bowl.jpg

## Heroku Deployer

Loops is built to use Heroku's [deploy hooks][deploy-hooks] to notice a push to your
build app, and then execute tests and promote your app using Heroku [pipelines][pipelines]
and more deploy hooks to move your app from build through test and into prod.

[deploy-hooks]: https://devcenter.heroku.com/articles/deploy-hooks
[pipelines]: https://devcenter.heroku.com/articles/labs-pipelines

### A Build Pipeline

Loops expects you to have a pipeline that your app works through, and steps you expect to
execute at each stage of the pipeline that will determine if that version of the app continues
downstream or if it stops the deployment pipeline. A typical pipeline looks like this:

```console
$ heroku pipeline -r build
Pipeline: myapp-build ---> myapp-test ---> myapp-prod
```

### A Repo Like Hubot

Like Github's wonderful Hubot, Loops is intended to be a dependency of a custom repo in which
you specify your basic app-specific data. There are many generic steps that you can configure
to run on your app.

#### Each Run

Here's an example configuration:

```json
{
  "myapp": {
    "build": "heroku run mocha -a myapp-build",
    "test": "curl https://myapp-test.herokuapp.com"
  }
}
```

#### Setup

Here's an example configuration:

```json
{
  "pipeline": ["build", "test", "prod"],
  "build": {
    "labs": "user-env-compile"
  }
}
```
