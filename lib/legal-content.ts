export type LegalBlock = string | { heading: string } | { list: string[] }

export interface LegalSection {
  id: string
  title: string
  blocks: LegalBlock[]
}

const SITE = "www.saintyve.com"
const ADDRESS = "Schweinheimer Straße 28, 63743 Aschaffenburg, Germany"
const EMAIL = "contact@saintyve.com"

export const legalSections: LegalSection[] = [
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    blocks: [
      `Welcome to our website ${SITE} (the “Site”). Please read our Privacy Policy carefully.`,
      "This Privacy Policy applies when you visit or surf the Site without purchasing any product, when you register on the Site and when you use our services for purchasing products. By using this Site, you accept the practices described in this Privacy Policy. If you do not want to accept the practices described in this Privacy Policy, please do not use the Site.",
      "Since personal data (“Personal Data”) of users and customers (collectively “Users”) of this Site is processed in the European Union, notably in Germany, any processing of Personal Data will be conducted in compliance with applicable European and German laws.",
      `Your Personal Data are collected and processed by Saint Yve as well as by its service providers located within and outside of the European Union (collectively “us”, “we”, “our”). Saint Yve has its registered office at ${ADDRESS}. For any issues relating to this Privacy Policy you can contact our customer care at ${EMAIL} and select ‘Privacy’ as the subject.`,
      "Your Personal Data will be processed to provide the services you subscribed to or reserved for registered users, to facilitate your navigation of and shopping from the website and to keep you informed of Saint Yve news and offers.",
      "Saint Yve is the controller of Personal Data collected and processed for the purpose of rendering the e-commerce services and the sale of products (herein the “Commercial Purposes”) through the Site.",
      "Saint Yve is the controller of Personal Data of Users and customers of the Site throughout the world, which is collected for conducting, concluding and performing transactions for purchasing products on the aforementioned Site. Saint Yve ensures that Personal Data are processed in a correct and lawful manner and in accordance with good practice. Any such processing of Personal Data will be conducted in compliance with applicable law.",
      "Saint Yve is the sole data controller of the Personal Data processed for marketing purposes, notably to send to Users, also through newsletter, information and updates on its products, offers, exclusive sales, promotional campaigns and on events and similar initiatives organized by Saint Yve (herein the “Marketing Purposes”).",

      { heading: "1. Our Policy" },
      "Everyone has the right to protection of his/her Personal Data. We respect Users' right to be informed regarding the collection of and other operations involving their Personal Data. In using data that may directly or indirectly identify you personally, we will apply a principle of strict necessity. For this reason, we have designed the Site in such a way that the use of your Personal Data will be kept to a minimum and will not exceed the purposes for which your Personal Data was collected and/or processed; we do not process your Personal Data when we can provide you with services through the use of anonymous or traffic data (such as marketing research made for improving our services, browsing data processed to provide you with customized contents or offers adapted to your preferred language, your location, etc.) or by other means which allow us to identify you, apart from when it is strictly necessary or upon request by competent public authorities or the police (for example, in case of traffic data or your IP address).",
      `This Privacy Policy provides you with all information needed to understand how we collect data which may identify the Site's Users. For further information on our Privacy Policy, please contact us through our customer care and select ‘Privacy’ as the subject, or write to Saint Yve at its registered office indicated above.`,

      { heading: "2. Who Collects and Processes Your Personal Data, How and for Which Purposes?" },
      "Saint Yve may be the controller of your Personal Data as it determines the Commercial Purposes and means of processing Personal Data. For the Commercial Purposes only, Saint Yve has appointed certain entities that will also process Personal Data relating to the Site's Users (herein the “Processors”).",
      "The above mentioned service providers and Processors have been chosen because of their experience in processing Personal Data and they provide sufficient guarantees regarding compliance with data protection laws (including the technical security measures governing the processing to be carried out). In processing the Personal Data for Commercial Purposes, the Processors shall act only under the instructions from Saint Yve. We regularly check that our Processors comply with our instructions and that they continue to provide sufficient guarantees regarding their full compliance with the provisions on Personal Data processing.",
      "Some of the Processors of your Personal Data appointed by Saint Yve for Commercial Purposes directly are:",
      {
        list: [
          `Our shipping carriers, for purposes related to shipping, delivering and returning products purchased on ${SITE};`,
          "Vercel Inc., for purposes related to the hosting of the Site and its servers;",
          "Supabase Inc., for purposes related to the storage of account and order data and user authentication;",
          "Cloudflare, Inc., for purposes related to the storage and delivery of product images;",
          "Mollie B.V., for purposes of acting as our online payment provider and monitoring and preventing e-commerce fraud;",
          "Resend, Inc., for purposes of sending transactional emails such as order confirmations.",
        ],
      },
      "For the Commercial Purposes, we collect your Personal Data (such as personal details, email, address, credit card numbers, bank code, tax code and telephone number, etc.) on your order form only for the purpose of selling the products ordered by you. Your Personal Data is mostly processed by electronic means and, in some circumstances, by paper-based means, such as when the processing of your Personal Data is required for preventing fraud on the Site. Your Personal Data shall be stored in a way which allows us to identify you for the period necessary for the purposes which the data was collected for and subsequently processed and, in any case, in accordance with applicable laws. Please report any modification of your Personal Data to our customer care and select ‘Privacy’ as the subject, or through your personal account on the Site, in order to ensure that your Personal Data is always accurate and up-to-date, relevant and complete. Your Personal Data shall not be disclosed to third parties other than us for purposes which are not permitted by law or without your consent.",
      "Aside from the Processors appointed for Personal Data processing, your Personal Data will be made available also to third parties, autonomous controllers, for purposes related to supplying services requested by Users (for example, for purchase transactions) or for purposes of third parties. For more information on the matter, see Section 4 (To Whom Your Personal Data Will Be Disclosed). Please contact our customer care and select ‘Privacy’ as the subject if you would like to receive a full list of our data Processors involved in processing your Personal Data.",
      "For the Marketing Purposes, we may process your Personal Data as well as browsing data (“Traffic Data”) resulting from the use of the Site and of our services by any User, in order to provide Users with customized contents and offers on our services or to deliver any newsletter they subscribed to, subject to their discretionary right to withdraw their subscription to such newsletter or to oppose or object to the receiving of any advertising or marketing content which we think is of interest to a specific User. For Marketing Purposes, Personal Data and Traffic Data is mostly processed by electronic means and shall be stored in any case, in accordance with applicable laws and available to our Processors.",
      "Moreover, your Personal Data may be disclosed to the police or to judicial authorities, according to applicable laws and upon a formal request by such entities, for example in the event we need to prevent fraud on the Site (anti-fraud services).",
      "Data Processors will also have access to your Personal Data as stated in Section 2 for the specific purposes stated therein. In all the above circumstances, your consent for data processing is not required as Personal Data processing would be necessary for the performance of Commercial Purposes.",
      "The reasons for collecting Personal Data will be expressly listed in the information of privacy statement that we will present from time to time on the page asking the User to provide his or her Personal Data, be it for Commercial Purposes or for Marketing Purposes. We may have access to third parties' Personal Data which was directly disclosed by its Users, for example when a User bought a product to be sent to a friend, when the User paying for the product is different from the recipient of the product, or when a User wishes to recommend to a friend a service of the Site or the sale of a particular product. In all of the above cases, please make sure you receive the consent of such individuals before disclosing their Personal Data to us and make sure you inform them about this Privacy Policy; you will be the only person liable in connection with the disclosure of information and data regarding such third parties if they have not provided you with their prior explicit consent for it and for any improper and unlawful use of that information. In any event, we shall fulfill any obligation to inform third parties required by law and, when necessary, shall request their explicit consent upon registering in their archives the Personal Data of the User indicated.",

      { heading: "3. What Happens If You Do Not Disclose Your Personal Data to Us?" },
      "Granting your Personal Data to us (in particular, your personal details, your email, your address, your credit/debit card numbers and bank code and your telephone number) is necessary for processing your order for the purchase of products on the Site, supplying other services provided on the website upon your request, or when your Personal Data is needed to fulfill obligations required by law or regulations. The refusal to provide us with some of your Personal Data necessary for performing the above purposes may consequently prevent us from processing your order for the purchase of products sold on the Site or fulfilling obligations required by law and other regulations. Therefore, failing to provide Personal Data may constitute, in some cases, a legitimate and justified reason for not processing your order for the purchase of products sold on the Site or not providing the Site's services.",
      "Disclosure of further Personal Data to us other than that required for fulfilling legal or contractual obligations and to properly browse our services with necessary Traffic Data is, on the contrary, optional and does not have any effect on the use of the Site and of its services or on the purchase of products on the Site. We will inform you at every step whether disclosing your Personal Data to us is compulsory or optional by marking with an appropriate symbol (*) the information that is compulsory or data needed for the purchase of products on the Site.",

      { heading: "4. To Whom Your Personal Data Will Be Disclosed?" },
      "Personal Data will be disclosed to third party companies that provide, on behalf of Saint Yve, specific services as data Processors or to other recipients of Personal Data collected by us that process your Personal Data only for the Commercial Purposes and, in any case, according to applicable laws and regulations.",
      "Notwithstanding the foregoing, Personal Data will not be disclosed to any other third parties or disseminated or transferred without informing our Users of such disclosure/dissemination/transfer, and, in any case, in accordance with the applicable laws.",

      { heading: "5. Security Measures" },
      "We have adopted security measures to protect Personal Data against accidental or unlawful destruction, accidental loss, alteration, unauthorized disclosure or access, and against all other reasons for data processing that do not comply with our Privacy Policy. For the best possible protection of your Personal Data outside the limits of our control and management of the same, it is advisable that your computer be provided with software devices that protect network data transmission/receipt (such as updated antivirus systems) and that your internet service provider take appropriate measures for the security of network data transmission (such as, for example, firewalls and anti-spam filtering).",

      { heading: "6. Cookies" },
      "The Site uses automatic systems of Traffic Data collection, such as cookies. A cookie is a file stored on the hard disk of the terminal of an internet User; it does not contain intelligible information but it allows linking between a terminal and other information about User's experience on the Site and his/her preferences expressed while choosing services and purchasing products offered by the Site provided by the Users. For cookies disseminated by our servers, no one else may gain access to the information contained therein. These information and data are gathered directly and automatically by the Site. The information collected by cookies will be processed in order to optimize the services of the Site. We have provided cookies in connection to functions such as selecting the country, the language, the location, browsing the catalogue, purchasing products online and in general in connection with the provision of services reserved to registered customers. Each internet browser allows the blocking or the deletion of cookies. Your internet browser contains instructions on these procedures. Please access the information on your internet browser if you wish to delete cookies.",
      "The acceptance of automatic data collection procedures and the use of cookies are necessary for using the Site and its services, including the purchase of products. If you have started the procedure of blocking or deleting cookies, we cannot ensure that all web pages of the Site will be displayed or that certain services will be supplied such as, for example, storage or display on the web pages of products you chose when you were finalizing the online purchase processes.",

      { heading: "7. Compulsory Processing" },
      "We wish to inform you that we may process your Personal Data also without your consent in certain circumstances provided by laws.",

      { heading: "8. Your Right to Access Personal Data and Further Rights" },
      "You are entitled to obtain, at any time, confirmation from us as to whether or not data relating to you is being processed, whether the data is not yet registered, and the communication in intelligible form of the data undergoing processing. Moreover, you are entitled to receive from us information on the source of your Personal Data; the purposes and way of processing your Personal Data; the logic involved in any electronic data processing; details of the data controller and of the data Processors; the names of the entities and categories of entities to whom your Personal Data may be disclosed or who may access your Personal Data, for example, as a data controller or a party so appointed. You can easily find part of the above information in our Privacy Policy. For further information, contact our customer care.",
      "You are entitled to obtain at any time from us:",
      {
        list: [
          "A. The updating, adjustment or, when you have an interest in such, the integration of your Personal Data;",
          "B. The deletion, the transformation into an anonymous form or blocking of your Personal Data (unlawfully processed), including data which does not need to be stored for the purposes for which it was collected and subsequently processed;",
          "C. The confirmation that the operations under letters A) and B) have been reported (together with the contents of the same) to whom the data was disclosed or disseminated, except when it becomes impossible or if the means used are clearly disproportionate to the right's protection.",
        ],
      },
      "You are entitled to object, in whole or in part:",
      {
        list: [
          "A. For legitimate reasons, to the processing of your Personal Data, even if it is related to the purposes for which it was collected;",
          "B. To the processing of your Personal Data for advertising or direct marketing purposes or in order to carry out marketing research or commercial communications.",
        ],
      },
      `You may freely exercise your rights at any time, provided that you do so in compliance with applicable laws, by sending your request to us through our customer care and select ‘Privacy’ as the subject, or by writing to us at our address mentioned in the introduction to this Privacy Policy. We will reply to you as necessary.`,

      { heading: "9. Opt-In / Opt-Out" },
      "Each time your consent is required, Saint Yve will inform you in advance and will give you the option to either provide or refuse your consent for the use of your Personal Data, including your email, for the above purposes, by ticking the appropriate boxes.",
      "We wish to inform you that we may process your Personal Data also without your consent in certain circumstances, such as when such processing is necessary for performing a legal obligation to which we are subject or when such processing is necessary for performing obligations undertaken in contracts with the Users.",
      "To the extent of applicable laws and subject to your rights, your Personal Data may be processed by us for sending you advertising or offers for marketing purposes about products and services unless you object to it at any time, either when your Personal Data has been collected or at any time, notably when receiving any offer from us.",
      "In any case, we wish to inform you that we guarantee that our Users may exercise, at any time and without having to state their reasoning, their right not to receive future communications connected to particular services upon request.",

      { heading: "10. Links to Other Websites" },
      "We do not control or monitor such websites or their web content. We shall not be held liable for the web content of such sites and for the rules adopted by them in terms of your privacy and the processing of your Personal Data while you are visiting those websites. Please pay attention when you connect to these websites through the links provided on our website and read their terms and conditions of use and their privacy policy carefully. Our Privacy Policy does not apply to third party websites and we are by no means liable for the privacy policy adopted by those websites. The Site provides links to other websites exclusively to help its Users in their searches and net-surfing activities and to allow links to other websites on the internet. When we provide links to other websites, we do not recommend the use of these websites and do not provide any guarantees regarding their web content or the services and products supplied and sold by these websites to internet Users.",

      { heading: "11. Contacts" },
      "If you wish to receive further information on how we process your Personal Data, please contact our customer service.",

      { heading: "12. Governing Law" },
      "To the extent that we are respectively established in Germany, this Privacy Policy is governed by German law and applicable European data protection law (herein and together, “Governing Laws”):",
      {
        list: [
          "For the processing of Personal Data carried out by Saint Yve as a data controller for online selling operations management; and",
          "For the other processing of Personal Data carried out by Saint Yve as a data controller for any other processing operations.",
        ],
      },

      { heading: "13. Amendments and Updating of This Privacy Policy" },
      "We may amend or simply update all or part of this Privacy Policy, including when amendments are made to legal provisions or regulations which govern data protection and protect your rights. The amendments and the updating of the Privacy Policy shall be binding as soon as they are published on the Site in this section. Therefore, you are requested to regularly access this section in order to check the publication of the most recent and updated Privacy Policy.",
    ],
  },

  {
    id: "return-policy",
    title: "Return Policy",
    blocks: [
      "All sales are final.",
      `If an item proves defective upon receipt, please contact ${EMAIL}. The issue at hand will be assessed and refund will be granted where applicable.`,
      {
        list: [
          "Must be unused, unworn, unwashed and in the same condition in which it was received by you;",
          "Must have all original tags still attached and intact;",
          "Must be returned complete with all of its parts and accessories;",
          "Must be sent in its original packaging;",
          "Must include its original packing slip;",
          "Must be shipped back to our fulfillment center within seven (7) days from the date of delivery; and",
          "Must be sent in one single shipment; products that belong to the same order must be returned to us at the same time.",
        ],
      },
      "If all of these conditions are satisfied, we will refund the value of the returned product(s), VAT included, less any original shipping costs. We will not issue any refunds for returns that do not satisfy all of the conditions indicated above; provided, however, that you will have the option to request within seven (7) days from being notified that you are not entitled to a refund that your merchandise be shipped back to you, in the condition in which it was received by Provider's fulfillment center.",
      "If you do not request the return of your merchandise within said seven-day period, you authorize Provider, and any of its affiliates or agents, to dispose of such merchandise as it sees fit.",
      "Returns/exchanges are to be shipped back at the customer's expense.",
      { heading: "Refund Policy" },
      "Refunds are processed within approximately three (3) business days from our receipt of your merchandise. Your refund will be credited back to the same payment method used to make the original purchase on this Site. If you paid by credit card, refund times will depend on the credit or debit card company’s policies. Be aware that the refund date for the credit will coincide with the date of the original payment, therefore you will not be charged any interest fees. If you paid by PayPal, refunds will be credited to your PayPal account and will be visible immediately. The date of reimbursement to the credit card associated with your PayPal account depends on the company that issued the card. We offer no refunds on any products designated on this Site as non-returnable.",
      { heading: "Identification Tag" },
      "All of our products come with an identification tag. Please try your item on before removing the tag, since we do not accept returns once the tag has been removed, broken or damaged in any way. Shoes come with a sticker under the sole; if you remove or alter this sticker, you may no longer return your purchase.",
      { heading: "Shipping Your Return" },
      "Your return can be sent to us via the carrier and label that we will provide you once the return has been authorized. If you wish to exchange the size or the color of an item, please directly contact our customer care.",
      { heading: "Disclaimer of Warranties and Limitation of Liability" },
      "Provider makes no representations or warranties of any kind, express or implied, as to the products included on the Site nor as to the merchandise being sold to you. To the fullest extent permissible by applicable law, Provider disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose and non-infringement, and there are no warranties, express or implied, which extend beyond the description of the merchandise contained on our order confirmation. Provider will not be liable for any damages of any kind arising from the use of this Site, including but not limited to direct, indirect, incidental, punitive and consequential damages.",
      "Certain state laws do not allow limitations on implied warranties or the exclusion or limitation of certain damages. If these laws apply to you, some or all of the above disclaimers, exclusions, or limitations may not apply to you, and you might have additional rights.",
    ],
  },

  {
    id: "terms-and-conditions-of-sale",
    title: "Terms and Conditions of Sale",
    blocks: [
      `The following general terms and conditions of sale govern the sale of merchandise by Saint Yve (the “Provider” or “We”) to you through ${SITE} (“the Site”). The Site is available for purchases made and delivered throughout the world. Your use of this Site to purchase merchandise indicates your agreement to follow and to be bound by these general terms and conditions of sale.`,

      { heading: "1. Orders & Products" },
      "All orders are subject to email confirmation by us. Please note that the products displayed on this Site may be out-of-stock or discontinued, and availability is not guaranteed. Please note that while we have tried to accurately display the colors of products, the actual colors you see will depend on your monitor and may not be accurate.",

      { heading: "2. Prices" },
      "All prices are in euros (EUR). Prices may change without notice from time to time. The total amount due is inclusive of VAT applied in accordance with applicable regulations based on your shipping address. The applicable VAT amount is indicated on the payment page of the cart.",
      "The amount of VAT charged on your order will depend upon various factors, including type of item purchased, sales price and destination of the shipment. Tax regulations may change between the time you place an order and the time of credit card charge authorization and this may affect the calculation of taxes. The amount appearing on your payment page of the cart may differ from the taxes ultimately charged as indicated in the invoice you will receive with the shipping confirmation email.",
      "Customers are responsible for all import duties, taxes, and customs fees that may apply to the shipment.",

      { heading: "3. Shipping Costs" },
      "You are responsible for the shipping costs associated with the delivery of the products you purchase on this Site as specified on your order confirmation.",

      { heading: "4. Shipments and Delivery" },
      "You bear all risks of loss and damage to the products from the time the product has cleared our fulfillment center. Delivery is deemed complete and title to the products passes to you upon acceptance of shipment by a common carrier.",

      { heading: "5. Returns and Refunds" },
      "Please refer to our Return and Refund Policy, which forms an integral part of these general terms and conditions of sale.",

      { heading: "6. Binding Agreement" },
      "Our order confirmation, these general terms and conditions of sale and our other Site policies shall be deemed the final and integrated agreement between you and us on the matters contained in these general terms and conditions of sale.",

      { heading: "7. Governing Law and Choice of Forum" },
      "The laws of the Federal Republic of Germany (without giving effect to its conflicts of law principles) govern all matters arising out of or relating to these general terms and conditions of sale, including, without limitation, their validity, interpretation, construction, performance, and enforcement. All legal proceedings arising out of or in connection with these general terms and conditions of sale shall be brought solely in the city of Aschaffenburg, Germany, to the extent permitted by mandatory consumer protection law.",

      { heading: "8. Disclaimers and Limitations of Liability" },
      `The Provider makes no representations or warranties of any kind, express or implied, as to the products included in ${SITE} nor as to the merchandise being sold to you. To the fullest extent permissible by applicable law, the Provider disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose and non-infringement, and there are no warranties, express or implied, which extend beyond the description of the merchandise contained on our order confirmation. The Provider will not be liable for any damages of any kind arising from the use of this Site, including but not limited to direct, indirect, incidental, punitive and consequential damages.`,
      "Certain laws do not allow limitations on implied warranties or the exclusion or limitation of certain damages. If these laws apply to you, some or all of the above disclaimers, exclusions, or limitations may not apply to you, and you might have additional rights.",

      { heading: "9. Severability" },
      "If any provision of these general terms and conditions of sale is determined to be invalid, illegal or unenforceable, the remaining provisions of these general terms and conditions of sale remain in full force to the extent permitted by law.",

      { heading: "10. Privacy" },
      "The terms and conditions of our Privacy Policy govern the processing of all Personal Data collected from you in connection with your purchase of products through this Site.",

      { heading: "11. Force Majeure" },
      "Provider shall not be liable for any delay or failure in performance caused by circumstances beyond its reasonable control.",

      { heading: "12. Errors and Inaccuracies" },
      "Our goal is to provide complete, accurate, and up-to-date information on our website. Unfortunately, it is not possible to ensure that any website is completely free of human or technological errors. This website may contain typographical mistakes, inaccuracies, or omissions, some of which may relate to pricing and availability, and product information. We reserve the right to correct any errors, inaccuracies or omissions, including after an order has been submitted, to cancel an order and to change or update information at any time without prior notice.",

      { heading: "13. Pricing" },
      `Prices displayed on the ${SITE} website are quoted in euros. While we try to ensure that all prices on our website are accurate, errors may occur. If we discover an error in the price of the merchandise you have ordered, we will give you the option of reconfirming your order at the correct price or canceling it. If we are unable to contact you, we will treat the order as cancelled.`,
    ],
  },

  {
    id: "terms-and-conditions-of-use",
    title: "Terms and Conditions of Use",
    blocks: [
      `Welcome to ${SITE}. These terms and conditions (the “General Terms and Conditions of Use”) govern your use of, access to, and purchase of products from ${SITE}. By using this Site, you agree to comply with and be bound by these General Terms and Conditions of Use. If you do not agree to these General Terms and Conditions of Use, please do not use this Site.`,

      { heading: "1. General" },
      `${SITE} is the property of Saint Yve, with registered office at ${ADDRESS} (“Saint Yve”).`,

      { heading: "2. Other Site Policies" },
      "Please review our General Terms and Conditions of Sale, Return Policy and Privacy Policy (collectively, the “Site Policies”). All Site Policies are incorporated in these General Terms and Conditions of Use by this reference and, therefore, apply to your access to, use of and purchase of products from this Site. If you do not agree to our Site Policies, please do not use this Site. We reserve the right to make changes to the Site, the Site Policies, and these General Terms and Conditions of Use at any time. If any of these conditions shall be deemed invalid, void, or for any reason unenforceable, that condition shall be deemed severable and shall not affect the validity and enforceability of any remaining condition.",

      { heading: "3. Purchase for Personal Use Only" },
      "You may purchase products on this Site only for personal use and not for resale. By placing your order, you certify that you are purchasing products for personal use only and not for resale and you accept our General Terms and Conditions of Sale. We reserve the right to refuse orders for any reason without explanation.",

      { heading: "4. User's Submissions" },
      "We welcome your comments and feedback regarding this Site, our products and our services. We do not, however, accept confidential or proprietary information. Accordingly, all comments, feedback, reviews, ideas, suggestions, materials, images, information and other submissions (collectively, the “Submissions”) disclosed, submitted or offered to the Provider via this Site, or otherwise, are not confidential. You represent and warrant that any Submissions that you submit to the Provider are made in compliance with applicable laws, do not violate any right of any third party, including privacy and intellectual property rights. By disclosing, submitting or offering any Submissions to the Provider, you grant the Provider and Saint Yve a nonexclusive, royalty-free, perpetual, irrevocable, and fully sub-licensable right to use, reproduce, modify, adapt, publish, translate, create derivative work from, distribute, display such material throughout the world in any media. You are and shall remain solely responsible for any Submissions you disclose, submit or offer to the Provider or Saint Yve.",

      { heading: "5. Privacy" },
      "We recommend that you read our Privacy Policy, which explains our online privacy practices.",

      { heading: "6. Copyright" },
      `All content included on ${SITE}, such as works, images, pictures, dialogues, music, sounds, videos, documents, drawings, figures, logos, menus, web pages, graphics, colors, schemes, tools, fonts, designs, diagrams, layouts, methods, processes, functions and software (collectively, the “Content”), is the property of Saint Yve or its content suppliers and is protected by national and international copyright and other intellectual property laws. You may not reproduce, publish, distribute, display, modify, create derivative work from, or exploit in any way, in whole or in part, the Content without the prior express written consent of Saint Yve, or its content suppliers, as the case may be. Saint Yve and its content suppliers shall have the exclusive right to authorize or prohibit in their sole discretion any reproduction, publication, distribution, display, modification, creation of derivative work from, or exploitation in any way of, in whole or in part, the Content. Saint Yve and its content suppliers shall have the right, at any time, to claim the authorship of any Content posted on this Site and to object to any use, distortion or other modification of such Content. Any reproduction, publication, distribution, display, modification, creation of derivative work from, or exploitation in any way of, the Content expressly authorized in writing by Saint Yve or its content suppliers shall be carried out by you for lawful purposes only and in compliance with all applicable laws.`,

      { heading: "7. License and Site Access" },
      "The viewing, printing or downloading of any Content from this Site grants you only a limited, non-exclusive and non-transferable license for use solely by you for your own personal use and not for republication, distribution, assignment, sublicense, sale, preparation of derivative works or other use. No part of any Content may be reproduced in any form or incorporated into any information system, electronic or mechanical, other than for your personal use (but not for resale or redistribution). Any unauthorized use of this Site and the Content immediately terminates the license granted by the Provider.",
      "You will be solely responsible for all damages and other harm resulting from your use of this Site and the Content. Saint Yve and the Provider shall not be deemed liable for any use of this Site and the Content made by you in violation of any applicable laws and regulations and these General Terms and Conditions of Use.",

      { heading: "8. Copyright Complaints" },
      `We respect the intellectual property of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please contact a Saint Yve copyright representative for further information. You may also contact our customer care at ${EMAIL} and use ‘Privacy’ as the subject.`,

      { heading: "9. Links to Other Websites" },
      "This Site may provide hyperlinks to third party websites (“Third Party Websites”). The Provider and Saint Yve do not operate, control, endorse or guarantee any Third Party Websites. You agree that the Provider and Saint Yve are not responsible for any content, services and/or products provided by any Third Party Website, nor are the Provider and Saint Yve responsible for any practice followed by such Third Party Website with respect to the collection and processing of Personal Data of their users. When you access any Third Party Website through a hyperlink posted on this Site, please carefully read the terms and conditions of use, privacy policy and other policies of such Third Party Website. Our policies do not apply to any Third Party Website.",
      "The Provider provides hyperlinks to Third Party Websites only for the convenience of its users. By providing hyperlinks to Third Party Websites, the Provider does not recommend that its users access such Third Party Websites.",
      "You agree that your use of any Third Party Website is at your sole risk and without warranties of any kind by the Provider, expressed, implied or otherwise, including, but not limited to, warranties of title, fitness for a particular purpose, merchantability or non-infringement. Under no circumstances are the Provider and/or Saint Yve liable for damages arising from any transaction between you and any Third Party Website or for any information appearing on Third Party Websites.",

      { heading: "10. Governing Law and Choice of Forum" },
      "The laws of the Federal Republic of Germany (without giving effect to its conflicts of law principles) govern all matters arising out of or relating to these General Terms and Conditions of Use, including, without limitation, their validity, interpretation, construction, performance, and enforcement. All legal proceedings arising out of or in connection with these General Terms and Conditions of Use shall be brought solely in the city of Aschaffenburg, Germany, to the extent permitted by mandatory consumer protection law.",

      { heading: "11. Disclaimer of Warranties and Limitation of Liability" },
      "This Site and all information, content, materials, products (including software) and services included on or otherwise made available to you through this Site are provided by the Provider on an “as is” and “as available” basis, unless otherwise specified in writing. The Provider makes no representations or warranties of any kind, express or implied, as to the operation of this Site or the information, content, materials, products (including software) or services included on or otherwise made available to you through this Site, unless otherwise specified in writing. You expressly agree that your use of this Site is at your sole risk.",
      "To the full extent permissible by applicable law, the Provider disclaims all warranties, express or implied, including, but not limited to, implied warranties of merchantability and fitness for a particular purpose. The Provider does not warrant that this Site; information, content, materials, products (including software) or services included on or otherwise made available to you through this Site; their servers; or email sent from the Provider are free of viruses or other harmful components. The Provider will not be liable for any damages of any kind arising from the use of this Site or from any information, content, materials, products (including software) or services included on or otherwise made available to you through this Site, including, but not limited to direct, indirect, incidental, punitive, and consequential damages, unless otherwise specified in writing.",
      "Certain laws do not allow limitations on implied warranties or the exclusion or limitation of certain damages. If these laws apply to you, some or all of the above disclaimers, exclusions, or limitations may not apply to you, and you might have additional rights.",
    ],
  },
]
