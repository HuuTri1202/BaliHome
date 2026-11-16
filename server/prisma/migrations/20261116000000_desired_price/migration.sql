-- Mức giá khách mong muốn (đồng), không bắt buộc; đi kèm khoảng ngân sách "budget"
ALTER TABLE "contact_requests" ADD COLUMN "desired_price" INTEGER;
