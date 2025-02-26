import CustomerRepositoryInterface from "../../domain/repository/customer.repository.interface";
import Customer from "../../domain/entity/customer";
import CustomerModel from "../db/sequelize/model/customer.model";
import Address from "../../domain/entity/address";


export default class CustomerRepository implements CustomerRepositoryInterface {
	async create(entity: Customer): Promise<void> {
		await CustomerModel.create({
			id: entity.id,
			name: entity.name,
			street: entity.address.street,
			number: entity.address.number,
			zipcode: entity.address.zip,
			city: entity.address.city,
			active: entity.isActive(),
			rewardPoints: entity.rewardPoints,
		});
	}

	async update(entity: Customer): Promise<void> {
		await CustomerModel.update(
			{
				name: entity.name,
				street: entity.address.street,
				number: entity.address.number,
				zipcode: entity.address.zip,
				city: entity.address.city,
				active: entity.isActive(),
				rewardPoints: entity.rewardPoints,
			},
			{
				where: {
					id: entity.id,
				},
			}
		);
	}

	async findById(id: string): Promise<Customer> {
		let customerModel;
		try {
			customerModel = await CustomerModel.findOne({
				where: {
					id,
				},
				rejectOnEmpty: true,
			});
		} catch (error) {
			throw new Error("Customer not found");
		}

		const customer = new Customer(id, customerModel.name);
		const address = new Address(
			customerModel.street,
			customerModel.number,
			customerModel.city,
			customerModel.zipcode,
		);
		customer.changeAddress(address);
		return customer;
	}

	async findAll(): Promise<Customer[]> {
		const customerModels = await CustomerModel.findAll();

		const customers = customerModels.map((customerModels) => {
			let customer = new Customer(customerModels.id, customerModels.name);
			customer.addRewardPoints(customerModels.rewardPoints);
			const address = new Address(
				customerModels.street,
				customerModels.number,
				customerModels.city,
				customerModels.zipcode,
			);
			customer.changeAddress(address);
			if (customerModels.active) {
				customer.activate();
			}
			return customer;
		});

		return customers;
	}
}
