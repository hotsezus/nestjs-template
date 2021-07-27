# Гайд по стилю разработки

---

## Наименования файлов

Для файлов различных типов в проекте предусмотрены соответствующие им постфиксы, которые следует использовать при создании новых файлов с содержанием, относящимся к конкретному типу.

Среди основных типов файлов:

1. Модули
   
    a. Базовые модули - `*.module.ts`
    
    b. GraphQL модули - `*.graphql-module.ts`
   
2. GraphQL резолверы
   
   a. Резолверы типов - `*.resolver.ts`
   
      * `@ResolveField` декораторы для полей, относящихся к типу
   
   b. Резолверы квери - `*.query-resolver.ts`

      * `@Query` декораторы для запросов, относящихся к типу

   с. Резолверы мутаций - `*.mutation-resolver.ts`

      * `@Mutation` декораторы для мутаций, относящихся к типу
   
3. GraphQL типы

   a. Object типы - `*.type.ts`

   b. Input типы - `*.input-type.ts`

4. ORM сущности

   a. Сами сущности - `*.entity.ts`

      * `@Entity` декоратор

   b. Описание полей, общих для сущностей и GraphQL типов - `*.fields.ts`
      
      * `@ObjectType` декоратор с параметром `isAbstract: true`
      * abstract класс

   с. Описание полей, общих для Entity, а также Object и Input GraphQL типов - `*.common-fields.ts`

      * `@ObjectType` и/или `@InputType` декораторы с параметром `isAbstract: true`
      * abstract класс
   

### Пример сущности

Возьмем в пример сущность User:

   * Общие для Entity, ObjectType и InputType поля сущности должны быть расположены в `user.common-fields.ts` файле

   * Общие для Entity и ObjectType поля должны быть расположены в `user.fields.ts`

   * Поля, недоступные в GraphQL типах, но необходимые в ORM сущности, должны быть в `user.entity.ts`

```
                                    @InputType
@Entity        @ObjectType          @ObjectType
User     <---- UserFields     <---  UserCommonFields
                 ^                    ^               ^
               @ObjectType          @InputType        @InputType
               UserType             UserCreateInput   UserUpdateInput
```

---

## Директории

Описание основных директорий:

- `bin` - входные точки для запуска проекта в разных режимах

- `cli` - CommandsModule, импортирующий cli команды из `cli/commands`

- `common` - CommonModule и импортированные в него модули. Содержит весь код, который обычно нужен проекту вне зависимости от режима работы

- `config` - директория с typescript файлами описывающими параметры разных модулей системы

- `database` - DatabaseModule, импортирующий модули всех ORM сущностей. Также содержит директорию `migrations`, содержащую в себе файлы миграций базы данных, сгенерированные TypeORM CLI

- `graphql` - AppGraphqlModule, импортирующий модули всех GraphQL типов

- `scheduler` - AppSchedulerModule, импортирующий все необходимые задачи, выполняемые по расписанию

- `utils` - директория (не модуль), содержащая чистые утилитарные функции и классы, не использующие модульность NestJS

- `worker` - ProcessorsModule, импортирующий исполнителей задач очередей из `worker/processors`
