import React from "react";
import { NavLink } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-2">页面不存在</h2>
      <NavLink to="/" className="btn btn-primary mt-2">返回首页</NavLink>
    </div>
  );
}
