# Как создать проект на основе этого шаблона?

Для создания проекта нужно выполнить несколько простых шагов:

1. Создать пустой репозиторий для нового проекта далее именуемого NEW_PROJECT_NAME
   
2. Склонировать этот репозиторий в директорию с именем нового проекта

```bash
$ git clone -b master --single-branch git@gitlab.com:proscom/nestjs-template.git NEW_PROJECT_NAME
```

3. В директории, созданной в результате пункта 2, выполнить следующую последовательность команд:

```bash
$ git remote rename origin upstream
$ git remote add origin NEW_PROJECT_URL
$ git push origin master
```

Таким образом в локальной директории нового проекта будет два remote'а:

1. `origin` - указывающий на новый репозиторий

2. `upstream` - указывающий на репозиторий шаблона