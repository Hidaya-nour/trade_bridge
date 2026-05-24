import argparse
import json

from src.models.predict import forecast_demand, recommend_suppliers


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    recommend_parser = subparsers.add_parser("recommend-supplier")
    recommend_parser.add_argument("--top-k", type=int, default=5)
    recommend_parser.add_argument("--retailer-id")
    recommend_parser.add_argument("--product-id")
    recommend_parser.add_argument("--seller-state")
    recommend_parser.add_argument("--product-category-name")

    forecast_parser = subparsers.add_parser("forecast-demand")
    forecast_parser.add_argument("--product-id", required=True)
    forecast_parser.add_argument("--seller-id")
    forecast_parser.add_argument("--horizon-days", type=int, default=7)

    args = parser.parse_args()

    if args.command == "recommend-supplier":
        print(
            recommend_suppliers(
                top_k=args.top_k,
                retailer_id=args.retailer_id,
                product_id=args.product_id,
                seller_state=args.seller_state,
                product_category_name=args.product_category_name,
            )
        )
        return

    result = forecast_demand(
        product_id=args.product_id,
        seller_id=args.seller_id,
        horizon_days=args.horizon_days,
    )
    print(json.dumps(result))


if __name__ == "__main__":
    main()
