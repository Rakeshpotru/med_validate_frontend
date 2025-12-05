import { AlloySpec, SimpleSpec } from '@ephox/alloy';

const promotionMessage = '';

interface PromotionSpec extends SimpleSpec {
  promotionLink: boolean;
}

const renderPromotion = (spec: PromotionSpec):  => {
  [];

  return {
    uid: 1,
    dom: 2,
  };
};

export { renderPromotion, PromotionSpec };
