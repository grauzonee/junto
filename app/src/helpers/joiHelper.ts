import { Schema } from "joi";

type Test<T extends Schema> = {
    [K in T.describe().keys]: string
}
