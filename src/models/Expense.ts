import { Table , Column , Model , DataType , ForeignKey , BelongsTo, HasMany, AllowNull } from "sequelize-typescript";
import Budget from "./Budget";

@Table({
    tableName: 'expenses'
})

class Expense extends Model {
    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare name: string
    
    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL
    })
    declare amount: number  

    @ForeignKey(() => Budget)
    declare budgetId: number

    @BelongsTo(() => Budget)
    declare budget: Budget


}

export default Expense